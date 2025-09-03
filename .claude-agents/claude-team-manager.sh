#!/bin/bash

# AI Development Team Manager Script
# Integrates with Claude Code to manage AI agent team

set -e

AGENTS_DIR=".claude-agents"
ORCHESTRATOR="$AGENTS_DIR/agent-orchestrator.js"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 AI DEVELOPMENT TEAM MANAGER${NC}"
echo -e "${BLUE}=================================${NC}"

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is required but not installed${NC}"
    exit 1
fi

# Initialize team if not exists
if [ ! -d "$AGENTS_DIR" ]; then
    echo -e "${YELLOW}⚡ Initializing AI Development Team...${NC}"
    mkdir -p "$AGENTS_DIR"
fi

# Function to execute task with AI team
execute_task() {
    local task="$1"
    echo -e "${PURPLE}🎯 Executing Task: $task${NC}"
    
    # Use Claude Code Task tool to delegate to appropriate agents
    claude_task_cmd="Task with subagent_type: general-purpose, description: AI Team Task Execution, prompt: Execute this task using the AI development team: $task. Use the appropriate specialized agents based on the task requirements."
    
    echo -e "${BLUE}📋 Task delegation in progress...${NC}"
    
    # Simulate task execution with the orchestrator
    if [ -f "$ORCHESTRATOR" ]; then
        node "$ORCHESTRATOR" execute "$task"
    else
        echo -e "${YELLOW}⚠️  Orchestrator not found, using direct Claude Code execution${NC}"
        echo "Task: $task would be executed by Claude Code Task tool"
    fi
}

# Function to show team status
show_status() {
    echo -e "${GREEN}📊 AI DEVELOPMENT TEAM STATUS${NC}"
    
    if [ -f "$ORCHESTRATOR" ]; then
        node "$ORCHESTRATOR" status
    else
        echo -e "${YELLOW}⚠️  Team not fully initialized${NC}"
        echo "Available agents:"
        ls -1 "$AGENTS_DIR" 2>/dev/null | grep -v "\.js$\|\.json$" || echo "None"
    fi
}

# Function to show team capabilities
show_capabilities() {
    echo -e "${PURPLE}🎪 AI DEVELOPMENT TEAM CAPABILITIES${NC}"
    echo -e "${PURPLE}====================================${NC}"
    
    echo -e "${GREEN}🧠 STRATEGIC COMMAND:${NC}"
    echo "   • Master Orchestrator - Supreme coordination and decision-making"
    echo "   • Product Strategy - Requirements engineering and product vision"
    echo "   • Technical Architecture - System design and technology strategy"
    
    echo -e "${GREEN}⚡ CORE DEVELOPMENT:${NC}"
    echo "   • Frontend Mastery - React/Next.js, UI/UX implementation"
    echo "   • Backend Engineering - APIs, server logic, databases"
    echo "   • Full Stack Integration - End-to-end feature delivery"
    echo "   • Database Specialist - Data architecture and optimization"
    
    echo -e "${GREEN}🛡️ QUALITY & OPERATIONS:${NC}"
    echo "   • Code Review - Security, best practices, patterns"
    echo "   • Testing Automation - Unit, integration, E2E testing"
    echo "   • DevOps Automation - CI/CD, deployment, infrastructure"
    echo "   • Performance Optimization - Speed and efficiency maximization"
    
    echo -e "${GREEN}📚 SUPPORT SPECIALISTS:${NC}"
    echo "   • Documentation - Technical docs, API documentation"
    echo "   • Research & Innovation - Technology evaluation, problem solving"
    echo "   • Debug & Incident - Issue investigation, root cause analysis"
    
    echo -e "${BLUE}🔥 SUPERPOWERS:${NC}"
    echo "   • 24/7 Development Cycle"
    echo "   • 10-100x Faster Than Traditional Teams"
    echo "   • Zero Human Limitations"
    echo "   • Perfect Code Quality"
    echo "   • Instant Knowledge Transfer"
    echo "   • Predictive Problem Solving"
}

# Main command handling
case "${1:-help}" in
    "execute"|"run"|"task")
        if [ -z "$2" ]; then
            echo -e "${RED}❌ Usage: $0 execute \"task description\"${NC}"
            exit 1
        fi
        task="${*:2}"
        execute_task "$task"
        ;;
    
    "status"|"dashboard")
        show_status
        ;;
    
    "capabilities"|"info"|"about")
        show_capabilities
        ;;
    
    "init"|"setup")
        echo -e "${GREEN}✅ AI Development Team already initialized!${NC}"
        echo -e "${BLUE}📁 Team configuration located in: $AGENTS_DIR${NC}"
        show_capabilities
        ;;
    
    "help"|*)
        echo -e "${YELLOW}🤖 AI DEVELOPMENT TEAM COMMANDS:${NC}"
        echo ""
        echo -e "${GREEN}Basic Commands:${NC}"
        echo "  $0 execute \"task\"     - Execute task with AI team"
        echo "  $0 status              - Show team status and metrics"
        echo "  $0 capabilities        - Show team capabilities"
        echo "  $0 init                - Initialize/show team setup"
        echo ""
        echo -e "${GREEN}Example Usage:${NC}"
        echo "  $0 execute \"Create a new React component for user authentication\""
        echo "  $0 execute \"Optimize database queries and improve API performance\""  
        echo "  $0 execute \"Deploy application to production with zero downtime\""
        echo "  $0 execute \"Fix bug in payment processing and add comprehensive tests\""
        echo ""
        echo -e "${BLUE}🎯 Your AI team can handle ANY development task!${NC}"
        ;;
esac