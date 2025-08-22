/**
 * 🚀 EMAIL MONITORING INITIALIZATION
 * Initialize and start email monitoring systems
 */

import { emailMonitoring } from './monitoring';
import { emailReporting } from './reporting';

/**
 * Initialize email monitoring and reporting systems
 */
export function initializeEmailMonitoring() {
  console.log('🚀 Initializing email monitoring and analytics systems...');
  
  try {
    // Start the monitoring daemon
    emailMonitoring.startMonitoring();
    
    // Schedule report generation runner (runs every hour)
    setInterval(async () => {
      try {
        await emailReporting.runScheduledReports();
      } catch (error) {
        console.error('❌ Failed to run scheduled reports:', error);
      }
    }, 60 * 60 * 1000); // Every hour
    
    console.log('✅ Email monitoring and analytics systems initialized successfully');
    
    // Initial health check after 10 seconds
    setTimeout(async () => {
      try {
        const healthResults = await emailMonitoring.performHealthCheck();
        console.log('🔍 Initial health check completed:', healthResults.length, 'services checked');
      } catch (error) {
        console.error('❌ Initial health check failed:', error);
      }
    }, 10000);
    
  } catch (error) {
    console.error('❌ Failed to initialize email monitoring systems:', error);
  }
}

// Auto-initialize if this module is imported (can be disabled by setting env var)
if (process.env.AUTO_INITIALIZE_EMAIL_MONITORING !== 'false') {
  // Only initialize in production or when explicitly enabled
  if (process.env.NODE_ENV === 'production' || process.env.ENABLE_EMAIL_MONITORING === 'true') {
    // Delay initialization to allow other systems to start
    setTimeout(initializeEmailMonitoring, 5000);
  } else {
    console.log('ℹ️ Email monitoring initialization skipped (development mode)');
  }
}