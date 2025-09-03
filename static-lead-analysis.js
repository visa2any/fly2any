const fs = require('fs');
const path = require('path');

console.log('🔍 Starting Static Lead Management Analysis...');

// Create results directory
const resultsDir = '/mnt/d/Users/vilma/fly2any/test-results';
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

const analysis = {
  timestamp: new Date().toISOString(),
  findings: [],
  issues: [],
  recommendations: [],
  codeAnalysis: {}
};

// Analyze Lead Management Structure
console.log('📋 Analyzing lead management structure...');

// Check for modern leads page
try {
  const modernLeadsPath = '/mnt/d/Users/vilma/fly2any/src/app/admin/leads/modern/page.tsx';
  if (fs.existsSync(modernLeadsPath)) {
    const content = fs.readFileSync(modernLeadsPath, 'utf8');
    
    analysis.findings.push({
      component: 'Modern Leads Page',
      status: 'EXISTS',
      path: modernLeadsPath,
      details: {
        lines: content.split('\n').length,
        hasUseState: content.includes('useState'),
        hasUseEffect: content.includes('useEffect'),
        hasErrorHandling: content.includes('try') && content.includes('catch'),
        hasFiltering: content.includes('filteredLeads'),
        hasTags: content.includes('tags'),
        hasStats: content.includes('stats')
      }
    });
  } else {
    analysis.issues.push({
      type: 'MISSING_FILE',
      severity: 'HIGH',
      component: 'Modern Leads Page',
      message: 'Modern leads page not found'
    });
  }
} catch (error) {
  analysis.issues.push({
    type: 'FILE_READ_ERROR',
    severity: 'HIGH',
    component: 'Modern Leads Page',
    message: error.message
  });
}

// Analyze LeadCard component
console.log('🎨 Analyzing LeadCard component...');

try {
  const leadCardPath = '/mnt/d/Users/vilma/fly2any/src/components/admin/leads/LeadCard.tsx';
  if (fs.existsSync(leadCardPath)) {
    const content = fs.readFileSync(leadCardPath, 'utf8');
    
    // Analyze CSS classes usage
    const adminClasses = content.match(/admin-[a-zA-Z-]+/g) || [];
    const tailwindClasses = content.match(/bg-[a-zA-Z0-9-]+|text-[a-zA-Z0-9-]+|border-[a-zA-Z0-9-]+/g) || [];
    
    analysis.findings.push({
      component: 'LeadCard Component',
      status: 'EXISTS',
      path: leadCardPath,
      details: {
        lines: content.split('\n').length,
        adminClasses: [...new Set(adminClasses)],
        tailwindClasses: [...new Set(tailwindClasses)],
        hasDropdown: content.includes('DropdownMenu'),
        hasAvatar: content.includes('Avatar'),
        hasStatusColors: content.includes('statusColors'),
        hasPriorityColors: content.includes('priorityColors'),
        hasContactButtons: content.includes('onContact')
      }
    });

    // Check for potential styling issues
    if (adminClasses.length > 0 && tailwindClasses.length > 0) {
      analysis.issues.push({
        type: 'MIXED_CSS_CLASSES',
        severity: 'MEDIUM',
        component: 'LeadCard',
        message: `Mixed CSS approach detected: ${adminClasses.length} admin classes + ${tailwindClasses.length} tailwind classes`,
        details: { adminClasses, tailwindClasses }
      });
    }

    // Check for hardcoded styles
    const inlineStyles = content.match(/style=\{[^}]+\}/g) || [];
    if (inlineStyles.length > 0) {
      analysis.issues.push({
        type: 'INLINE_STYLES',
        severity: 'LOW',
        component: 'LeadCard',
        message: `Found ${inlineStyles.length} inline style(s)`,
        details: { inlineStyles }
      });
    }

  } else {
    analysis.issues.push({
      type: 'MISSING_FILE',
      severity: 'HIGH',
      component: 'LeadCard Component',
      message: 'LeadCard component not found'
    });
  }
} catch (error) {
  analysis.issues.push({
    type: 'FILE_READ_ERROR',
    severity: 'HIGH',
    component: 'LeadCard Component',
    message: error.message
  });
}

// Analyze Gmail API
console.log('📧 Analyzing Gmail API endpoint...');

try {
  const gmailApiPath = '/mnt/d/Users/vilma/fly2any/src/app/api/email-gmail/route.ts';
  if (fs.existsSync(gmailApiPath)) {
    const content = fs.readFileSync(gmailApiPath, 'utf8');
    
    analysis.findings.push({
      component: 'Gmail API Endpoint',
      status: 'EXISTS',
      path: gmailApiPath,
      details: {
        lines: content.split('\n').length,
        hasPostMethod: content.includes('export async function POST'),
        hasGetMethod: content.includes('export async function GET'),
        hasErrorHandling: content.includes('try') && content.includes('catch'),
        hasEnvironmentVariables: content.includes('process.env'),
        hasValidation: content.includes('if (!email)'),
        hasNodemailer: content.includes('nodemailer')
      }
    });

    // Check for potential security issues
    if (!content.includes('process.env.GMAIL_EMAIL') || !content.includes('process.env.GMAIL_APP_PASSWORD')) {
      analysis.issues.push({
        type: 'MISSING_ENV_VARS',
        severity: 'HIGH',
        component: 'Gmail API',
        message: 'Gmail environment variables may not be properly configured'
      });
    }

  } else {
    analysis.issues.push({
      type: 'MISSING_FILE',
      severity: 'HIGH',
      component: 'Gmail API Endpoint',
      message: 'Gmail API endpoint not found'
    });
  }
} catch (error) {
  analysis.issues.push({
    type: 'FILE_READ_ERROR',
    severity: 'HIGH',
    component: 'Gmail API Endpoint',
    message: error.message
  });
}

// Analyze Admin CSS
console.log('🎨 Analyzing admin CSS...');

try {
  const globalCssPath = '/mnt/d/Users/vilma/fly2any/src/app/globals.css';
  if (fs.existsSync(globalCssPath)) {
    const content = fs.readFileSync(globalCssPath, 'utf8');
    
    const adminCssClasses = content.match(/\.admin-[a-zA-Z-]+/g) || [];
    
    analysis.findings.push({
      component: 'Global CSS',
      status: 'EXISTS',
      path: globalCssPath,
      details: {
        lines: content.split('\n').length,
        adminClasses: [...new Set(adminCssClasses)],
        hasTailwindImports: content.includes('@tailwind'),
        hasCustomProperties: content.includes('--'),
        hasResponsiveDesign: content.includes('@media')
      }
    });

    if (adminCssClasses.length === 0) {
      analysis.issues.push({
        type: 'MISSING_ADMIN_CSS',
        severity: 'HIGH',
        component: 'Global CSS',
        message: 'No admin CSS classes found in global.css'
      });
    }

  } else {
    analysis.issues.push({
      type: 'MISSING_FILE',
      severity: 'HIGH',
      component: 'Global CSS',
      message: 'Global CSS file not found'
    });
  }
} catch (error) {
  analysis.issues.push({
    type: 'FILE_READ_ERROR',
    severity: 'HIGH',
    component: 'Global CSS',
    message: error.message
  });
}

// Analyze leads API
console.log('🔗 Analyzing leads API...');

try {
  const leadsApiPath = '/mnt/d/Users/vilma/fly2any/src/app/api/admin/leads/route.ts';
  if (fs.existsSync(leadsApiPath)) {
    const content = fs.readFileSync(leadsApiPath, 'utf8');
    
    analysis.findings.push({
      component: 'Leads API',
      status: 'EXISTS',
      path: leadsApiPath,
      details: {
        lines: content.split('\n').length,
        hasGetMethod: content.includes('export async function GET'),
        hasPostMethod: content.includes('export async function POST'),
        hasPutMethod: content.includes('export async function PUT'),
        hasDeleteMethod: content.includes('export async function DELETE'),
        hasErrorHandling: content.includes('try') && content.includes('catch'),
        hasDatabase: content.includes('prisma') || content.includes('db'),
        hasValidation: content.includes('validation') || content.includes('validate')
      }
    });

  } else {
    analysis.issues.push({
      type: 'MISSING_FILE',
      severity: 'HIGH',
      component: 'Leads API',
      message: 'Leads API endpoint not found'
    });
  }
} catch (error) {
  analysis.issues.push({
    type: 'FILE_READ_ERROR',
    severity: 'HIGH',
    component: 'Leads API',
    message: error.message
  });
}

// Generate recommendations based on findings
console.log('💡 Generating recommendations...');

analysis.recommendations = [
  {
    priority: 'HIGH',
    category: 'UI/UX',
    title: 'Standardize CSS Approach',
    description: 'Choose between admin CSS classes or Tailwind CSS for consistency',
    impact: 'Improves maintainability and reduces CSS conflicts'
  },
  {
    priority: 'HIGH',
    category: 'Email',
    title: 'Verify Email Configuration',
    description: 'Ensure Gmail environment variables are properly set',
    impact: 'Enables email notifications for lead management'
  },
  {
    priority: 'MEDIUM',
    category: 'Server',
    title: 'Investigate Server Startup Issues',
    description: 'The development server appears to have startup problems',
    impact: 'Prevents proper testing and development'
  },
  {
    priority: 'MEDIUM',
    category: 'Components',
    title: 'Improve LeadCard Styling',
    description: 'Remove inline styles and use consistent CSS approach',
    impact: 'Better visual consistency and easier theming'
  },
  {
    priority: 'LOW',
    category: 'Testing',
    title: 'Add Component Tests',
    description: 'Implement automated tests for lead management components',
    impact: 'Reduces bugs and improves reliability'
  }
];

// Calculate summary statistics
const highIssues = analysis.issues.filter(i => i.severity === 'HIGH').length;
const mediumIssues = analysis.issues.filter(i => i.severity === 'MEDIUM').length;
const lowIssues = analysis.issues.filter(i => i.severity === 'LOW').length;

analysis.summary = {
  totalFindings: analysis.findings.length,
  totalIssues: analysis.issues.length,
  issuesBySeverity: {
    high: highIssues,
    medium: mediumIssues,
    low: lowIssues
  },
  totalRecommendations: analysis.recommendations.length
};

// Save analysis results
const analysisPath = path.join(resultsDir, 'lead-management-static-analysis.json');
fs.writeFileSync(analysisPath, JSON.stringify(analysis, null, 2));

// Generate human-readable report
const reportPath = path.join(resultsDir, 'lead-management-analysis-report.md');
const report = generateAnalysisReport(analysis);
fs.writeFileSync(reportPath, report);

console.log('📊 Static Analysis Complete!');
console.log(`✅ Components Found: ${analysis.findings.length}`);
console.log(`⚠️  Issues Found: ${analysis.issues.length} (${highIssues} high, ${mediumIssues} medium, ${lowIssues} low)`);
console.log(`💡 Recommendations: ${analysis.recommendations.length}`);
console.log(`📁 Analysis saved to: ${analysisPath}`);
console.log(`📄 Report saved to: ${reportPath}`);

function generateAnalysisReport(analysis) {
  let report = `# Lead Management Interface - Static Analysis Report\n\n`;
  report += `**Generated:** ${analysis.timestamp}\n\n`;
  
  // Executive Summary
  report += `## 🎯 Executive Summary\n\n`;
  report += `- **Components Analyzed:** ${analysis.summary.totalFindings}\n`;
  report += `- **Issues Found:** ${analysis.summary.totalIssues}\n`;
  report += `  - High Priority: ${analysis.summary.issuesBySeverity.high} 🔴\n`;
  report += `  - Medium Priority: ${analysis.summary.issuesBySeverity.medium} 🟡\n`;
  report += `  - Low Priority: ${analysis.summary.issuesBySeverity.low} 🟢\n`;
  report += `- **Recommendations:** ${analysis.summary.totalRecommendations}\n\n`;
  
  // Findings
  report += `## 📋 Component Analysis\n\n`;
  analysis.findings.forEach((finding, index) => {
    report += `### ${index + 1}. ${finding.component} ✅\n\n`;
    report += `**Path:** \`${finding.path}\`\n\n`;
    report += `**Details:**\n`;
    report += `\`\`\`json\n${JSON.stringify(finding.details, null, 2)}\n\`\`\`\n\n`;
  });
  
  // Issues
  if (analysis.issues.length > 0) {
    report += `## ⚠️ Issues Found\n\n`;
    analysis.issues.forEach((issue, index) => {
      const severityIcon = issue.severity === 'HIGH' ? '🔴' : issue.severity === 'MEDIUM' ? '🟡' : '🟢';
      report += `### ${index + 1}. ${issue.component} ${severityIcon}\n\n`;
      report += `**Type:** ${issue.type}\n`;
      report += `**Severity:** ${issue.severity}\n`;
      report += `**Message:** ${issue.message}\n\n`;
      if (issue.details) {
        report += `**Details:**\n`;
        report += `\`\`\`json\n${JSON.stringify(issue.details, null, 2)}\n\`\`\`\n\n`;
      }
    });
  }
  
  // Recommendations
  report += `## 💡 Recommendations\n\n`;
  analysis.recommendations.forEach((rec, index) => {
    const priorityIcon = rec.priority === 'HIGH' ? '🔴' : rec.priority === 'MEDIUM' ? '🟡' : '🟢';
    report += `### ${index + 1}. ${rec.title} ${priorityIcon}\n\n`;
    report += `**Category:** ${rec.category}\n`;
    report += `**Priority:** ${rec.priority}\n`;
    report += `**Description:** ${rec.description}\n`;
    report += `**Impact:** ${rec.impact}\n\n`;
  });
  
  // Next Steps
  report += `## 🚀 Next Steps\n\n`;
  report += `1. **Fix High Priority Issues** - Address server startup and missing components\n`;
  report += `2. **Standardize CSS** - Choose consistent styling approach\n`;
  report += `3. **Configure Email** - Set up Gmail environment variables\n`;
  report += `4. **Test Manually** - Start server and test lead management interface\n`;
  report += `5. **Implement Automation** - Add proper testing and monitoring\n\n`;
  
  return report;
}

console.log('🎉 Analysis completed successfully!');