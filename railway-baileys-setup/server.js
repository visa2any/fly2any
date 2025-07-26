const express = require('express');
const cors = require('cors');
const { makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const QRCode = require('qrcode');
const P = require('pino');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// WhatsApp instance
let sock = null;
let qrCode = null;
let connectionState = 'close';
let isInitializing = false;

// Logger
const logger = P({ level: 'info' });

// Auth path for Railway persistent storage
const authPath = path.join(__dirname, 'whatsapp-auth');

// Ensure auth directory exists
if (!fs.existsSync(authPath)) {
  fs.mkdirSync(authPath, { recursive: true });
  console.log('📁 Auth directory created:', authPath);
}

// Convert QR to base64
async function convertQRToBase64(qrText) {
  try {
    const qrDataURL = await QRCode.toDataURL(qrText, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrDataURL;
  } catch (error) {
    console.error('❌ QR conversion error:', error);
    throw error;
  }
}

// Initialize WhatsApp
async function initializeWhatsApp() {
  if (isInitializing) {
    console.log('⏳ Already initializing...');
    return { success: false, error: 'Already initializing' };
  }

  try {
    isInitializing = true;
    console.log('🚀 Initializing WhatsApp on Railway...');

    const { state, saveCreds } = await useMultiFileAuthState(authPath);

    sock = makeWASocket({
      auth: state,
      logger,
      printQRInTerminal: true,
      browser: ["Fly2Any-Railway", "Chrome", "1.0.0"],
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 60000,
      keepAliveIntervalMs: 30000
    });

    return new Promise((resolve) => {
      let resolved = false;

      // Timeout after 30 seconds
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          isInitializing = false;
          console.log('⏰ Initialization timeout');
          resolve({
            success: false,
            error: 'Timeout waiting for QR code',
            qrCode: qrCode
          });
        }
      }, 30000);

      // Handle credentials update
      sock.ev.on('creds.update', saveCreds);

      // Handle connection updates
      sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        console.log('📡 Connection update:', { connection, hasQR: !!qr });
        connectionState = connection || 'connecting';

        if (qr && !resolved) {
          console.log('📱 QR Code received! Processing...');
          try {
            qrCode = await convertQRToBase64(qr);
            console.log('✅ QR Code converted successfully!');

            resolved = true;
            isInitializing = false;
            clearTimeout(timeout);

            resolve({
              success: true,
              qrCode: qrCode,
              isConnected: false
            });
          } catch (qrError) {
            console.error('❌ QR processing error:', qrError);
            resolved = true;
            isInitializing = false;
            clearTimeout(timeout);

            resolve({
              success: false,
              error: 'Failed to process QR code'
            });
          }
        }

        if (connection === 'open' && !resolved) {
          console.log('✅ WhatsApp connected successfully!');
          connectionState = 'open';
          qrCode = null; // Clear QR when connected

          resolved = true;
          isInitializing = false;
          clearTimeout(timeout);

          resolve({
            success: true,
            qrCode: null,
            isConnected: true
          });
        }

        if (connection === 'close') {
          connectionState = 'close';
          const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
          console.log('📱 Connection closed, should reconnect:', shouldReconnect);

          if (shouldReconnect) {
            setTimeout(() => {
              console.log('🔄 Attempting to reconnect...');
              initializeWhatsApp();
            }, 5000);
          }

          if (!resolved) {
            resolved = true;
            isInitializing = false;
            clearTimeout(timeout);

            resolve({
              success: false,
              error: 'Connection closed before completion'
            });
          }
        }
      });
    });

  } catch (error) {
    isInitializing = false;
    console.error('❌ WhatsApp initialization error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// API Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'baileys-whatsapp',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Initialize WhatsApp
app.post('/api/whatsapp/init', async (req, res) => {
  console.log('📞 POST /api/whatsapp/init - Initializing WhatsApp...');
  
  try {
    const result = await initializeWhatsApp();
    
    if (result.success) {
      res.json({
        success: true,
        message: 'WhatsApp initialized successfully',
        qrCode: result.qrCode,
        isConnected: result.isConnected || false
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Init API error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get WhatsApp status
app.get('/api/whatsapp/status', (req, res) => {
  console.log('📊 GET /api/whatsapp/status - Getting status...');
  
  res.json({
    success: true,
    connected: connectionState === 'open',
    connectionState: connectionState,
    qrCode: qrCode,
    isInitializing: isInitializing,
    timestamp: new Date().toISOString()
  });
});

// Send message
app.post('/api/whatsapp/send', async (req, res) => {
  const { phone, message } = req.body;
  
  console.log('📤 POST /api/whatsapp/send - Sending message...');
  
  if (!sock || connectionState !== 'open') {
    return res.status(400).json({
      success: false,
      error: 'WhatsApp not connected'
    });
  }

  try {
    // Format phone number
    const formattedPhone = phone.includes('@') ? phone : `${phone}@s.whatsapp.net`;
    
    await sock.sendMessage(formattedPhone, { text: message });
    
    res.json({
      success: true,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('❌ Send message error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Disconnect WhatsApp
app.post('/api/whatsapp/disconnect', async (req, res) => {
  console.log('🔌 POST /api/whatsapp/disconnect - Disconnecting...');
  
  try {
    if (sock) {
      await sock.logout();
      sock = null;
    }
    
    qrCode = null;
    connectionState = 'close';
    isInitializing = false;
    
    res.json({
      success: true,
      message: 'WhatsApp disconnected successfully'
    });
  } catch (error) {
    console.error('❌ Disconnect error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Catch all other routes
app.get('/', (req, res) => {
  res.json({
    service: 'Baileys WhatsApp Service',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: 'GET /health',
      init: 'POST /api/whatsapp/init',
      status: 'GET /api/whatsapp/status',
      send: 'POST /api/whatsapp/send',
      disconnect: 'POST /api/whatsapp/disconnect'
    }
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Baileys WhatsApp service running on port ${PORT}`);
  console.log(`📍 Service available at: http://0.0.0.0:${PORT}`);
  console.log(`🔗 Health check: http://0.0.0.0:${PORT}/health`);
  
  // Auto-initialize WhatsApp on startup
  setTimeout(() => {
    console.log('🤖 Auto-initializing WhatsApp...');
    initializeWhatsApp().then(result => {
      if (result.success) {
        console.log('✅ Auto-initialization successful');
      } else {
        console.log('⚠️ Auto-initialization failed:', result.error);
      }
    });
  }, 2000);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  if (sock) {
    sock.end();
  }
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  if (sock) {
    sock.end();
  }
  process.exit(0);
});