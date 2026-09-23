#!/bin/bash
# ===========================================
# ISO Support App - Server Setup Script
# ===========================================
#
# วิธีใช้:
#   chmod +x setup-server.sh
#   sudo ./setup-server.sh
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# ===========================================
# Check if running as root
# ===========================================

if [ "$EUID" -ne 0 ]; then
    error "Please run as root: sudo ./setup-server.sh"
fi

echo ""
echo "=========================================="
echo "🔧 ISO Support App - Server Setup"
echo "=========================================="
echo ""

# ===========================================
# Step 1: System Update
# ===========================================

log "Step 1: Updating system..."
apt update && apt upgrade -y
success "System updated"

# ===========================================
# Step 2: Install Node.js
# ===========================================

log "Step 2: Installing Node.js v24..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
    apt install -y nodejs
    success "Node.js installed: $(node -v)"
else
    warning "Node.js already installed: $(node -v)"
fi

# ===========================================
# Step 3: Install Git
# ===========================================

log "Step 3: Installing Git..."
if ! command -v git &> /dev/null; then
    apt install -y git
    success "Git installed: $(git --version)"
else
    warning "Git already installed: $(git --version)"
fi

# ===========================================
# Step 4: Install PM2
# ===========================================

log "Step 4: Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    success "PM2 installed: $(pm2 -v)"
else
    warning "PM2 already installed: $(pm2 -v)"
fi

# ===========================================
# Step 5: Setup PM2 Startup
# ===========================================

log "Step 5: Setting up PM2 startup..."
pm2 startup systemd -u root --hp /root
success "PM2 startup configured"

# ===========================================
# Step 6: Create directories
# ===========================================

log "Step 6: Creating directories..."
mkdir -p /www/wwwroot
mkdir -p /www/wwwlogs
mkdir -p /www/wwwbackups/iso-support-app
mkdir -p /var/log/pm2
success "Directories created"

# ===========================================
# Step 7: Clone repository
# ===========================================

log "Step 7: Cloning repository..."
cd /www/wwwroot
if [ ! -d "iso-support-app" ]; then
    git clone https://github.com/akradechLao/iso-support-app.git iso-support-app
    success "Repository cloned"
else
    warning "Repository already exists, pulling latest..."
    cd iso-support-app
    git pull origin master
fi

# ===========================================
# Step 8: Install dependencies & build
# ===========================================

log "Step 8: Installing dependencies and building..."
cd /www/wwwroot/iso-report.northernthai.co.th
npm install
npm run build
success "Application built"

# ===========================================
# Step 9: Setup PM2
# ===========================================

log "Step 9: Setting up PM2..."
cd /www/wwwroot/iso-report.northernthai.co.th
pm2 start ecosystem.config.js
pm2 save
success "PM2 configured and started"

# ===========================================
# Step 10: Install Nginx (if not using AaPanel)
# ===========================================

log "Step 10: Checking Nginx..."
if ! command -v nginx &> /dev/null; then
    warning "Nginx not found. If using AaPanel, Nginx is already installed."
    warning "If not using AaPanel, install with: apt install nginx -y"
else
    success "Nginx is installed"
fi

# ===========================================
# Step 11: Setup Firewall
# ===========================================

log "Step 11: Configuring firewall..."
if command -v ufw &> /dev/null; then
    ufw allow OpenSSH
    ufw allow 'Nginx Full'
    ufw allow 8888/tcp  # AaPanel
    echo "y" | ufw enable
    success "Firewall configured"
else
    warning "UFW not found. Please configure firewall manually."
fi

# ===========================================
# Summary
# ===========================================

echo ""
echo "=========================================="
echo "✅ Server Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Configure domain DNS to point to this server"
echo "  2. Add Node.js project in AaPanel"
echo "  3. Configure Nginx reverse proxy"
echo "  4. Setup SSL certificate"
echo ""
echo "Quick commands:"
echo "  pm2 status                    # Check app status"
echo "  pm2 logs iso-support-app      # View logs"
echo "  pm2 restart iso-support-app   # Restart app"
echo ""
echo "AaPanel commands:"
echo "  bt 14                         # View panel info"
echo "  bt 1                          # Restart panel"
echo ""
