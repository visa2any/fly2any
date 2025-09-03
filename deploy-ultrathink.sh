#!/bin/bash

# 🚀 ULTRATHINK PLAYWRIGHT MCP DEPLOYMENT LAUNCHER
# ================================================
# Convenient launcher for enterprise deployment system

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Banner
echo -e "${PURPLE}"
echo "🎯 ULTRATHINK PLAYWRIGHT MCP ENTERPRISE DEPLOYMENT"
echo "=================================================="
echo -e "${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js >= 18.0.0${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | sed 's/v//')
NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1)

if [ "$NODE_MAJOR" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version $NODE_VERSION detected. Please upgrade to >= 18.0.0${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js version $NODE_VERSION detected${NC}"

# Create logs directory
mkdir -p logs

# Function to show menu
show_menu() {
    echo -e "${BLUE}"
    echo "Select deployment option:"
    echo "========================="
    echo -e "${NC}"
    echo "1) 🚀 Full ULTRATHINK Deployment (Recommended)"
    echo "2) 🔍 Preflight Checks Only"
    echo "3) 🏗️  Main Deployment Only"
    echo "4) 🧪 Comprehensive Testing Only"
    echo "5) 🔄 Automated Recovery Only"
    echo "6) 📊 View Last Report"
    echo "7) 🧹 Clean Logs"
    echo "8) ❓ Help & Documentation"
    echo "9) 🚪 Exit"
    echo ""
    echo -n "Enter your choice (1-9): "
}

# Function to run command with logging
run_with_logging() {
    local command="$1"
    local description="$2"
    
    echo -e "${YELLOW}🔧 $description...${NC}"
    echo "$(date): Starting $description" >> logs/launcher.log
    
    if eval "$command" >> logs/launcher.log 2>&1; then
        echo -e "${GREEN}✅ $description completed successfully${NC}"
        echo "$(date): $description completed successfully" >> logs/launcher.log
        return 0
    else
        echo -e "${RED}❌ $description failed. Check logs/launcher.log for details${NC}"
        echo "$(date): $description failed" >> logs/launcher.log
        return 1
    fi
}

# Function to view last report
view_last_report() {
    echo -e "${BLUE}📊 LAST DEPLOYMENT REPORT${NC}"
    echo "=========================="
    
    if [ -f "logs/ultrathink-master-report.json" ]; then
        echo -e "${GREEN}Master Report Found:${NC}"
        echo ""
        
        # Extract key information using node
        node -e "
        const fs = require('fs');
        try {
            const report = JSON.parse(fs.readFileSync('logs/ultrathink-master-report.json', 'utf8'));
            console.log('📅 Timestamp:', report.timestamp);
            console.log('⏱️  Duration:', report.duration);
            console.log('🎯 Overall Success:', report.overallSuccess ? '✅ YES' : '❌ NO');
            console.log('📊 Success Rate:', report.summary.successRate + '%');
            console.log('🔢 Phases:', report.summary.successfulPhases + '/' + report.summary.totalPhases);
            console.log('');
            console.log('📋 Phase Results:');
            Object.entries(report.phases).forEach(([phase, result]) => {
                if (result) {
                    console.log('  ' + phase + ':', result.success ? '✅' : '❌');
                }
            });
            if (report.recommendations && report.recommendations.length > 0) {
                console.log('');
                console.log('💡 Recommendations:');
                report.recommendations.forEach((rec, i) => {
                    console.log('  ' + (i+1) + '. ' + rec);
                });
            }
        } catch (error) {
            console.log('❌ Could not parse report:', error.message);
        }
        " 2>/dev/null || echo -e "${RED}❌ Could not parse report${NC}"
        
        echo ""
        echo "Full report available at: logs/ultrathink-master-report.json"
    else
        echo -e "${YELLOW}⚠️ No master report found. Run a deployment first.${NC}"
    fi
}

# Function to clean logs
clean_logs() {
    echo -e "${YELLOW}🧹 Cleaning deployment logs...${NC}"
    
    if [ -d "logs" ]; then
        rm -f logs/*.log
        rm -f logs/*.json
        rm -f logs/*.png
        echo -e "${GREEN}✅ Logs cleaned successfully${NC}"
    else
        echo -e "${YELLOW}⚠️ No logs directory found${NC}"
    fi
}

# Function to show help
show_help() {
    echo -e "${BLUE}"
    echo "📚 ULTRATHINK DEPLOYMENT SYSTEM HELP"
    echo "===================================="
    echo -e "${NC}"
    echo "This system provides enterprise-grade React/Next.js deployment with:"
    echo ""
    echo "🔧 COMPONENTS:"
    echo "  • Master Orchestrator: Coordinates all deployment phases"
    echo "  • Enterprise Deployment: 7-phase deployment process"
    echo "  • Comprehensive Testing: Multi-browser validation"
    echo "  • Automated Recovery: Self-healing capabilities"
    echo ""
    echo "📋 PHASES:"
    echo "  1. Preflight Checks - System requirements validation"
    echo "  2. Environment Cleanup - Clean slate preparation"
    echo "  3. Dependency Installation - Package management"
    echo "  4. React Validation - ReactCurrentDispatcher fixes"
    echo "  5. TypeScript Validation - Compilation verification"
    echo "  6. Playwright Testing - Multi-browser testing"
    echo "  7. Production Validation - Build verification"
    echo ""
    echo "📊 REPORTS:"
    echo "  • logs/ultrathink-master-report.json - Main report"
    echo "  • logs/deployment-report.json - Deployment details"
    echo "  • logs/comprehensive-test-report.json - Test results"
    echo "  • logs/recovery-report.json - Recovery operations"
    echo ""
    echo "🆘 RECOVERY STRATEGIES:"
    echo "  1. Emergency node_modules reset"
    echo "  2. React version alignment"
    echo "  3. Next.js configuration repair"
    echo "  4. TypeScript configuration repair"
    echo "  5. Dependency tree repair"
    echo "  6. Cache eviction"
    echo "  7. Port conflict resolution"
    echo "  8. Memory leak fixes"
    echo "  9. Nuclear option (complete reset)"
    echo ""
    echo "📖 Documentation: ULTRATHINK-DEPLOYMENT-GUIDE.md"
}

# Main menu loop
while true; do
    echo ""
    show_menu
    read -r choice
    echo ""
    
    case $choice in
        1)
            echo -e "${PURPLE}🚀 EXECUTING FULL ULTRATHINK DEPLOYMENT${NC}"
            echo "======================================="
            run_with_logging "node ultrathink-master-deploy.js" "Full ULTRATHINK Deployment"
            ;;
        2)
            echo -e "${BLUE}🔍 PREFLIGHT CHECKS${NC}"
            echo "=================="
            run_with_logging "node ultrathink-master-deploy.js --preflight-only" "Preflight Checks"
            ;;
        3)
            echo -e "${YELLOW}🏗️ MAIN DEPLOYMENT${NC}"
            echo "=================="
            run_with_logging "node ultrathink-master-deploy.js --deploy-only" "Main Deployment"
            ;;
        4)
            echo -e "${GREEN}🧪 COMPREHENSIVE TESTING${NC}"
            echo "======================="
            run_with_logging "node ultrathink-master-deploy.js --test-only" "Comprehensive Testing"
            ;;
        5)
            echo -e "${RED}🔄 AUTOMATED RECOVERY${NC}"
            echo "===================="
            run_with_logging "node ultrathink-master-deploy.js --recovery-only" "Automated Recovery"
            ;;
        6)
            view_last_report
            ;;
        7)
            clean_logs
            ;;
        8)
            show_help
            ;;
        9)
            echo -e "${GREEN}👋 Goodbye! ULTRATHINK deployment system ready.${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Invalid choice. Please select 1-9.${NC}"
            ;;
    esac
    
    # Pause before showing menu again
    echo ""
    echo -e "${YELLOW}Press Enter to continue...${NC}"
    read -r
done