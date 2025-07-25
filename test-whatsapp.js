#!/usr/bin/env node

/**
 * Test script to verify WhatsApp Baileys QR code generation
 */

require('dotenv').config({ path: '.env.local' });

async function testWhatsAppInitialization() {
    try {
        console.log('🧪 Testing WhatsApp Baileys initialization...');
        console.log('📊 Environment check:');
        console.log(`   N8N_WEBHOOK_WHATSAPP: ${process.env.N8N_WEBHOOK_WHATSAPP ? '✅ Set' : '❌ Missing'}`);
        console.log(`   NEXT_PUBLIC_APP_URL: ${process.env.NEXT_PUBLIC_APP_URL ? '✅ Set' : '❌ Missing'}`);

        // Import the service
        const { WhatsAppBaileysService } = await import('./src/lib/whatsapp-baileys.ts');
        const service = WhatsAppBaileysService.getInstance();

        console.log('\n🚀 Starting initialization...');
        const result = await service.initialize();

        console.log('\n📊 Initialization Result:');
        console.log(`   Success: ${result.success ? '✅' : '❌'}`);
        console.log(`   QR Code: ${result.qrCode ? '✅ Generated' : '❌ Not generated'}`);
        console.log(`   Is Ready: ${result.isReady ? '✅ Connected' : '⚠️ Waiting for scan'}`);
        
        if (result.error) {
            console.log(`   Error: ${result.error}`);
        }

        if (result.qrCode) {
            console.log(`   QR Code Length: ${result.qrCode.length} characters`);
            console.log('   ✅ QR code successfully generated!');
        }

        // Test status endpoint
        const status = service.getStatus();
        console.log('\n📊 Service Status:');
        console.log(`   Connected: ${status.isConnected ? '✅' : '❌'}`);
        console.log(`   Connection State: ${status.connectionState}`);
        console.log(`   QR Available: ${status.qrCode ? '✅' : '❌'}`);

        console.log('\n🎯 Test completed!');
        
        // Cleanup
        setTimeout(() => {
            console.log('🧹 Cleaning up...');
            service.disconnect();
            process.exit(0);
        }, 2000);

    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

// Run the test
testWhatsAppInitialization();