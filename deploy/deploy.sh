#!/bin/bash
# ===========================================
# ISO Support App - Deployment Script
# ===========================================
#
# วิธีใช้:
#   ./deploy.sh              # Deploy to production
#   ./deploy.sh production   # Deploy to production
#   ./deploy.sh staging      # Deploy to staging
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/www/wwwroot/iso-support-app"
APP_DIR="${PROJECT_DIR}/app"
BACKUP_DIR="/www/wwwbackups/iso-support-app"
LOG_FILE="/www/wwwlogs/deploy-$(date +%Y%m%d-%H%M%S).log"

# Functions
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}❌ $1${NC}" | tee -a "$LOG_FILE"
    exit 1
}

# ===========================================
# Main Deployment
# ===========================================

echo ""
echo "=========================================="
echo "🚀 ISO Support App - Deployment Script"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    warning "Running as non-root user. Some operations may require sudo."
fi

# Create backup directory
mkdir -p "$BACKUP_DIR"
mkdir -p "$(dirname "$LOG_FILE")"

log "Starting deployment..."
log "Project directory: $PROJECT_DIR"
log "App directory: $APP_DIR"

# Step 1: Backup current build
log "Step 1: Backing up current build..."
if [ -d "$APP_DIR/.next" ]; then
    BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
    cp -r "$APP_DIR/.next" "$BACKUP_DIR/$BACKUP_NAME"
    success "Backup created: $BACKUP_DIR/$BACKUP_NAME"
else
    warning "No existing build to backup"
fi

# Step 2: Pull latest code
log "Step 2: Pulling latest code..."
cd "$PROJECT_DIR"
if [ -d .git ]; then
    git pull origin master 2>&1 | tee -a "$LOG_FILE"
    success "Code updated"
else
    warning "Not a git repository, skipping pull"
fi

# Step 3: Install dependencies
log "Step 3: Installing dependencies..."
cd "$APP_DIR"
npm ci --production=false 2>&1 | tee -a "$LOG_FILE"
success "Dependencies installed"

# Step 4: Build application
log "Step 4: Building application..."
npm run build 2>&1 | tee -a "$LOG_FILE"
success "Build completed"

# Step 5: Restart PM2
log "Step 5: Restarting PM2..."
cd "$APP_DIR"
pm2 delete iso-support-app 2>/dev/null || true
pm2 start ecosystem.config.js 2>&1 | tee -a "$LOG_FILE"
pm2 save 2>&1 | tee -a "$LOG_FILE"
success "PM2 restarted"

# Step 6: Verify deployment
log "Step 6: Verifying deployment..."
sleep 5

PM2_STATUS=$(pm2 jlist 2>/dev/null | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ "$PM2_STATUS" = "online" ]; then
    success "App is running (PM2 status: online)"
else
    warning "App status: $PM2_STATUS - may need a moment to start"
fi

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/ 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    success "Health check passed (HTTP $HTTP_CODE)"
else
    warning "Health check returned HTTP $HTTP_CODE - app may still be starting"
fi

# Step 7: Cleanup old backups (keep last 5)
log "Step 7: Cleaning up old backups..."
cd "$BACKUP_DIR"
ls -dt */ 2>/dev/null | tail -n +6 | xargs rm -rf 2>/dev/null || true
success "Old backups cleaned"

echo ""
echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="
echo ""
log "Deployment finished at $(date)"
echo ""
