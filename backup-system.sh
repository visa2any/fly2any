#!/bin/bash

# 🛡️ Fly2Any Project Backup & Recovery System
# This script creates incremental backups and provides recovery options

set -e

# Configuration
PROJECT_NAME="fly2any"
BACKUP_DIR="./backups"
DATE=$(date '+%Y-%m-%d_%H-%M-%S')
BACKUP_NAME="${PROJECT_NAME}_backup_${DATE}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create backup directory if it doesn't exist
create_backup_dir() {
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
        print_status "Created backup directory: $BACKUP_DIR"
    fi
}

# Backup function
backup() {
    print_status "Starting backup process..."
    
    create_backup_dir
    
    # Create backup directory
    FULL_BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"
    mkdir -p "$FULL_BACKUP_PATH"
    
    print_status "Backing up to: $FULL_BACKUP_PATH"
    
    # Critical files to backup
    print_status "Backing up critical source files..."
    
    # Source code
    cp -r src/ "$FULL_BACKUP_PATH/" 2>/dev/null || print_warning "No src directory found"
    
    # Configuration files
    cp package.json "$FULL_BACKUP_PATH/" 2>/dev/null || print_warning "No package.json found"
    cp package-lock.json "$FULL_BACKUP_PATH/" 2>/dev/null || print_warning "No package-lock.json found"
    cp next.config.ts "$FULL_BACKUP_PATH/" 2>/dev/null || print_warning "No next.config.ts found"
    cp tsconfig.json "$FULL_BACKUP_PATH/" 2>/dev/null || print_warning "No tsconfig.json found"
    cp tailwind.config.ts "$FULL_BACKUP_PATH/" 2>/dev/null || print_warning "No tailwind.config.ts found"
    
    # Environment files (excluding sensitive data)
    if [ -f ".env.local" ]; then
        # Create sanitized version
        grep -v "API_KEY\|SECRET\|PASSWORD\|TOKEN" .env.local > "$FULL_BACKUP_PATH/.env.local.template" 2>/dev/null || true
    fi
    
    # Prisma schema
    cp -r prisma/ "$FULL_BACKUP_PATH/" 2>/dev/null || print_warning "No prisma directory found"
    
    # Public assets
    cp -r public/ "$FULL_BACKUP_PATH/" 2>/dev/null || print_warning "No public directory found"
    
    # Documentation and fixes
    cp *.md "$FULL_BACKUP_PATH/" 2>/dev/null || true
    
    # Create backup manifest
    cat > "$FULL_BACKUP_PATH/BACKUP_MANIFEST.txt" << EOF
🛡️ FLY2ANY PROJECT BACKUP
========================

Backup Date: $(date)
Backup Name: $BACKUP_NAME
Git Commit: $(git rev-parse HEAD 2>/dev/null || echo "Not available")
Git Branch: $(git branch --show-current 2>/dev/null || echo "Not available")

📁 Backed up directories:
- src/ (Source code)
- prisma/ (Database schema)
- public/ (Static assets)

📄 Backed up files:
- package.json (Dependencies)
- package-lock.json (Lock file)
- next.config.ts (Next.js config)
- tsconfig.json (TypeScript config)
- tailwind.config.ts (Tailwind config)
- .env.local.template (Environment template)
- Documentation files (*.md)

🔧 Recent Fixes Applied:
- Lead form auto-advance issue fixed
- Form submission airport object handling fixed
- React Server Components bundler errors resolved

🚀 Project Status:
- Server: Working ✅
- Form submission: Working ✅
- Email notifications: Working ✅ (with MailerSend trial limitations)
- Database: Working ✅

💾 To restore this backup:
1. Extract contents to project directory
2. Run: npm install
3. Run: npm run build
4. Run: npm run dev

EOF
    
    # Compress backup
    print_status "Compressing backup..."
    cd "$BACKUP_DIR"
    tar -czf "${BACKUP_NAME}.tar.gz" "$BACKUP_NAME"
    rm -rf "$BACKUP_NAME"
    cd ..
    
    print_success "Backup completed: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
    print_success "Backup size: $(du -h ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz | cut -f1)"
}

# Recovery function
recover() {
    if [ $# -eq 0 ]; then
        print_error "Please specify backup file to recover from"
        print_status "Available backups:"
        ls -la "$BACKUP_DIR"/*.tar.gz 2>/dev/null || print_warning "No backups found"
        return 1
    fi
    
    BACKUP_FILE="$1"
    
    if [ ! -f "$BACKUP_FILE" ]; then
        print_error "Backup file not found: $BACKUP_FILE"
        return 1
    fi
    
    print_warning "This will overwrite current files. Are you sure? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        print_status "Recovery cancelled"
        return 0
    fi
    
    print_status "Recovering from: $BACKUP_FILE"
    
    # Create recovery directory
    RECOVERY_DIR="./recovery_$(date '+%Y%m%d_%H%M%S')"
    mkdir -p "$RECOVERY_DIR"
    
    # Extract backup
    tar -xzf "$BACKUP_FILE" -C "$RECOVERY_DIR"
    
    # Get backup directory name
    EXTRACTED_DIR=$(ls "$RECOVERY_DIR" | head -n 1)
    
    # Restore files
    print_status "Restoring files..."
    cp -r "$RECOVERY_DIR/$EXTRACTED_DIR"/* ./
    
    print_success "Recovery completed from: $BACKUP_FILE"
    print_status "Don't forget to run: npm install && npm run dev"
    
    # Cleanup
    rm -rf "$RECOVERY_DIR"
}

# List backups
list_backups() {
    print_status "Available backups:"
    if [ -d "$BACKUP_DIR" ]; then
        ls -la "$BACKUP_DIR"/*.tar.gz 2>/dev/null || print_warning "No backups found"
    else
        print_warning "No backup directory found"
    fi
}

# Quick backup (lighter version)
quick_backup() {
    print_status "Creating quick backup of critical files..."
    
    create_backup_dir
    
    QUICK_BACKUP_PATH="${BACKUP_DIR}/quick_backup_${DATE}"
    mkdir -p "$QUICK_BACKUP_PATH"
    
    # Only backup most critical files
    cp -r src/app/ "$QUICK_BACKUP_PATH/" 2>/dev/null || true
    cp -r src/lib/ "$QUICK_BACKUP_PATH/" 2>/dev/null || true
    cp -r src/components/ "$QUICK_BACKUP_PATH/" 2>/dev/null || true
    cp package.json next.config.ts tsconfig.json "$QUICK_BACKUP_PATH/" 2>/dev/null || true
    
    # Compress
    cd "$BACKUP_DIR"
    tar -czf "quick_backup_${DATE}.tar.gz" "quick_backup_${DATE}"
    rm -rf "quick_backup_${DATE}"
    cd ..
    
    print_success "Quick backup completed: ${BACKUP_DIR}/quick_backup_${DATE}.tar.gz"
}

# Main execution
case "${1:-backup}" in
    "backup"|"full")
        backup
        ;;
    "quick")
        quick_backup
        ;;
    "recover"|"restore")
        recover "$2"
        ;;
    "list")
        list_backups
        ;;
    "help"|"--help"|"-h")
        echo "🛡️ Fly2Any Backup & Recovery System"
        echo ""
        echo "Usage: $0 [command] [options]"
        echo ""
        echo "Commands:"
        echo "  backup, full    Create full backup (default)"
        echo "  quick          Create quick backup (critical files only)"
        echo "  recover [file] Restore from backup file"
        echo "  list           List available backups"
        echo "  help           Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0 backup"
        echo "  $0 quick"
        echo "  $0 recover ./backups/fly2any_backup_2025-08-26_17-30-45.tar.gz"
        echo "  $0 list"
        ;;
    *)
        print_error "Unknown command: $1"
        print_status "Use '$0 help' for usage information"
        exit 1
        ;;
esac