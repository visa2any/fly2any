/**
 * WhatsApp Baileys Optimized for Vercel Serverless
 * Simplified version with memory-based session storage
 */

import { makeWASocket, DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import P from 'pino';

// In-memory storage for QR codes (temporary solution)
let globalQRCode: string | null = null;
let globalConnectionState: string = 'close';
let isInitializing = false;

interface InitResult {
  success: boolean;
  qrCode?: string;
  error?: string;
  isReady?: boolean;
}

export class WhatsAppVercelService {
  private static instance: WhatsAppVercelService;
  private sock: any = null;
  private logger: any;

  private constructor() {
    this.logger = P({ level: 'error' }); // Minimal logging for serverless
  }

  public static getInstance(): WhatsAppVercelService {
    if (!WhatsAppVercelService.instance) {
      WhatsAppVercelService.instance = new WhatsAppVercelService();
    }
    return WhatsAppVercelService.instance;
  }

  async initialize(): Promise<InitResult> {
    try {
      // Prevent multiple initializations
      if (isInitializing) {
        console.log('⏳ Already initializing...');
        return {
          success: false,
          error: 'Already initializing, please wait'
        };
      }

      isInitializing = true;
      console.log('🚀 Starting WhatsApp initialization (Vercel optimized)...');

      // Use temporary directory for auth (will be cleaned up after serverless function ends)
      const authPath = '/tmp/whatsapp-auth';
      const { state, saveCreds } = await useMultiFileAuthState(authPath);

      // Create socket with optimized settings for serverless
      this.sock = makeWASocket({
        auth: state,
        logger: this.logger,
        printQRInTerminal: false,
        browser: ["Fly2Any-Vercel", "Chrome", "1.0.0"],
        connectTimeoutMs: 30000, // 30 seconds
        defaultQueryTimeoutMs: 30000,
        keepAliveIntervalMs: 60000, // Longer keep alive for serverless
        generateHighQualityLinkPreview: false, // Disable for performance
        syncFullHistory: false, // Don't sync history for faster startup
        markOnlineOnConnect: false // Don't mark online immediately
      });

      return new Promise((resolve) => {
        let resolved = false;
        
        // Timeout after 35 seconds
        const timeout = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            isInitializing = false;
            console.log('⏰ Timeout: No QR code generated');
            resolve({
              success: false,
              error: 'Timeout waiting for QR code'
            });
          }
        }, 35000);

        // Handle credentials update
        this.sock.ev.on('creds.update', saveCreds);

        // Handle connection updates
        this.sock.ev.on('connection.update', async (update: any) => {
          const { connection, lastDisconnect, qr } = update;
          
          console.log('📡 Connection update:', { connection, hasQR: !!qr });
          globalConnectionState = connection || 'connecting';

          if (qr && !resolved) {
            console.log('📱 QR Code received! Converting...');
            
            try {
              // Convert QR to base64 quickly
              const QRCodeLib = await import('qrcode');
              const qrDataURL = await QRCodeLib.toDataURL(qr, {
                width: 256,
                margin: 1,
                color: { dark: '#000000', light: '#FFFFFF' }
              });
              
              globalQRCode = qrDataURL;
              console.log('✅ QR Code converted successfully!');
              
              resolved = true;
              isInitializing = false;
              clearTimeout(timeout);
              
              resolve({
                success: true,
                qrCode: globalQRCode || undefined,
                isReady: false
              });
              
            } catch (qrError) {
              console.error('❌ QR conversion error:', qrError);
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
            globalConnectionState = 'open';
            
            resolved = true;
            isInitializing = false;
            clearTimeout(timeout);
            
            resolve({
              success: true,
              qrCode: globalQRCode || undefined,
              isReady: true
            });
          }

          if (connection === 'close') {
            globalConnectionState = 'close';
            const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('📱 Connection closed, should reconnect:', shouldReconnect);
            
            if (!resolved) {
              resolved = true;
              isInitializing = false;
              clearTimeout(timeout);
              
              resolve({
                success: false,
                error: 'Connection closed before QR code could be generated'
              });
            }
          }
        });

        // Force immediate connection attempt
        setTimeout(() => {
          if (this.sock && !resolved) {
            console.log('⚡ Forcing connection check...');
            // Just log current state, don't interfere
            console.log('Current state:', globalConnectionState);
          }
        }, 2000);
      });

    } catch (error) {
      isInitializing = false;
      console.error('❌ WhatsApp initialization error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  getStatus() {
    return {
      isConnected: globalConnectionState === 'open',
      connectionState: globalConnectionState,
      qrCode: globalQRCode,
      isInitializing
    };
  }

  getConnectionStatus() {
    return this.getStatus();
  }

  async disconnect() {
    try {
      if (this.sock) {
        await this.sock.logout();
        this.sock = null;
      }
      globalQRCode = null;
      globalConnectionState = 'close';
      isInitializing = false;
      console.log('✅ WhatsApp disconnected');
      return true;
    } catch (error) {
      console.error('❌ Disconnect error:', error);
      return false;
    }
  }
}