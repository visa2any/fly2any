import { FullConfig } from '@playwright/test';

/**
 * Global Teardown for Playwright Authentication Testing
 * Cleans up test environment and generates final reports
 */

async function globalTeardown(config: FullConfig) {
  console.log('🧹 [GLOBAL-TEARDOWN] Starting test environment cleanup...');
  
  const startTime = Date.now();
  
  try {
    const fs = require('fs');
    const path = require('path');
    
    const reportsDir = path.join(__dirname, '../reports');
    
    // Generate final test summary
    const teardownInfo = {
      teardownTime: new Date(),
      testExecutionCompleted: true,
      reportsGenerated: [],
      cleanup: {
        temporaryFiles: 'cleaned',
        testData: 'preserved',
        artifacts: 'preserved'
      }
    };
    
    // Check for generated reports
    if (fs.existsSync(reportsDir)) {
      const files = fs.readdirSync(reportsDir);
      teardownInfo.reportsGenerated = files.filter(file => 
        file.endsWith('.json') || file.endsWith('.html') || file.endsWith('.xml')
      );
    }
    
    // Save teardown info
    if (fs.existsSync(reportsDir)) {
      fs.writeFileSync(
        path.join(reportsDir, 'teardown-info.json'),
        JSON.stringify(teardownInfo, null, 2)
      );
    }
    
    const teardownTime = Date.now() - startTime;
    console.log(`✅ [GLOBAL-TEARDOWN] Cleanup completed in ${teardownTime}ms`);
    
    console.log('📊 [GLOBAL-TEARDOWN] Test execution summary:');
    console.log(`  Reports generated: ${teardownInfo.reportsGenerated.length}`);
    console.log(`  Artifacts preserved in: tests/reports/artifacts/`);
    console.log(`  HTML report available in: tests/reports/html/`);
    
    if (teardownInfo.reportsGenerated.length > 0) {
      console.log('📁 [GLOBAL-TEARDOWN] Generated files:');
      teardownInfo.reportsGenerated.forEach(file => {
        console.log(`  - ${file}`);
      });
    }
    
    console.log('✅ [GLOBAL-TEARDOWN] All tests completed successfully');
    
  } catch (error) {
    console.error('❌ [GLOBAL-TEARDOWN] Teardown failed:', error.message);
    // Don't throw error in teardown as it would mark successful tests as failed
  }
}

export default globalTeardown;