#!/bin/bash
# ================================================
# ISO Support App - All-in-One Setup Script
# ================================================
# Usage: sudo ./setup-all.sh --domain YOUR_DOMAIN.COM --ip YOUR_SERVER_IP
# ================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Variables
DOMAIN=""
SERVER_IP=""
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="/www/wwwroot/iso-report.northernthai.co.th"
LOG_FILE="/tmp/iso-setup-$(date +%Y%m%d-%H%M%S).log"

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --domain) DOMAIN="$2"; shift ;;
        --ip) SERVER_IP="$2"; shift ;;
        --help)
            echo "Usage: sudo ./setup-all.sh --domain YOUR_DOMAIN.COM --ip YOUR_SERVER_IP"
            echo ""
            echo "Options:"
            echo "  --domain    Your domain name (e.g., iso.yourdomain.com)"
            echo "  --ip        Your server IP address"
            echo "  --help      Show this help message"
            exit 0
            ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

# Validate inputs
if [ -z "$DOMAIN" ] || [ -z "$SERVER_IP" ]; then
    echo -e "${RED}Error: Missing required parameters${NC}"
    echo "Usage: sudo ./setup-all.sh --domain YOUR_DOMAIN.COM --ip YOUR_SERVER_IP"
    exit 1
fi

# Functions
print_header() {
    echo ""
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}========================================${NC}"
    echo ""
}

print_step() {
    echo -e "${BLUE}[STEP $1]${NC} $2"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "Please run as root (use sudo)"
        exit 1
    fi
}

# ================================================
# PHASE 1: System Preparation
# ================================================
phase1() {
    print_header "PHASE 1: System Preparation"
    
    # Update system
    print_step "1.1" "Updating system..."
    apt update -qq >> "$LOG_FILE" 2>&1
    apt upgrade -y -qq >> "$LOG_FILE" 2>&1
    print_success "System updated"
    
    # Install Node.js 24
    print_step "1.2" "Installing Node.js 24..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v)
        print_warning "Node.js already installed: $NODE_VERSION"
    else
        curl -fsSL https://deb.nodesource.com/setup_24.x | bash - >> "$LOG_FILE" 2>&1
        apt install -y nodejs >> "$LOG_FILE" 2>&1
        print_success "Node.js installed"
    fi
    
    # Verify Node.js
    print_step "1.3" "Verifying Node.js..."
    node -v >> "$LOG_FILE" 2>&1
    npm -v >> "$LOG_FILE" 2>&1
    print_success "Node.js: $(node -v), npm: $(npm -v)"
    
    # Install other dependencies
    print_step "1.4" "Installing dependencies..."
    apt install -y git curl wget sqlite3 >> "$LOG_FILE" 2>&1
    print_success "Dependencies installed"
    
    # Install PM2
    print_step "1.5" "Installing PM2..."
    if command -v pm2 &> /dev/null; then
        print_warning "PM2 already installed"
    else
        npm install -g pm2 >> "$LOG_FILE" 2>&1
        print_success "PM2 installed"
    fi
    
    # Enable PM2 startup as www (app owner), not root
    sudo -u www env PM2_HOME=/home/www/.pm2 pm2 startup systemd -u www --hp /home/www >> "$LOG_FILE" 2>&1 || true
    print_success "PM2 startup configured for www"
}

# ================================================
# PHASE 2: Application Setup
# ================================================
phase2() {
    print_header "PHASE 2: Application Setup"
    
    # Clone repository
    print_step "2.1" "Cloning repository..."
    if [ -d "$APP_DIR" ]; then
        print_warning "Repository already exists, pulling latest..."
        cd "$APP_DIR"
        git pull origin master >> "$LOG_FILE" 2>&1
    else
        cd /www/wwwroot
        git clone https://github.com/akradechLao/iso-support-app.git iso-report.northernthai.co.th >> "$LOG_FILE" 2>&1
        cd "$APP_DIR"
    fi
    print_success "Repository ready"
    
    # Install app deps/build as www
    print_step "2.2" "Installing app dependencies as www..."
    cd "$APP_DIR"
    sudo -u www npm install >> "$LOG_FILE" 2>&1
    print_success "Dependencies installed"
    
    # Build application as www
    print_step "2.3" "Building application as www..."
    sudo -u www npm run build >> "$LOG_FILE" 2>&1
    print_success "Application built"
    
    # Setup database
    print_step "2.4" "Setting up database..."
    cd "$APP_DIR"
    chmod +x deploy/setup-database.sh
    ./deploy/setup-database.sh >> "$LOG_FILE" 2>&1
    print_success "Database ready"
    
    # Setup PM2 as www
    print_step "2.5" "Starting application with PM2 (www)..."
    cd "$APP_DIR"
    sudo -u www env PM2_HOME=/home/www/.pm2 bash -c 'cd /www/wwwroot/iso-report.northernthai.co.th && pm2 delete iso-support-app 2>/dev/null || true; pm2 start ecosystem.config.js && pm2 save' >> "$LOG_FILE" 2>&1
    print_success "Application started as www"
    
    # Verify app is running
    sleep 3
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 | grep -q "200"; then
        print_success "Application responding on port 3001"
    else
        print_warning "Application may need a moment to start..."
    fi
}

# ================================================
# PHASE 3: Nginx Configuration
# ================================================
phase3() {
    print_header "PHASE 3: Nginx Configuration"
    
    # Install Nginx config from single template (do not embed config here)
    print_step "3.1" "Installing Nginx configuration from template..."

    NGINX_CONF="/www/server/panel/vhost/nginx/iso-report.northernthai.co.th.conf"
    TEMPLATE="$SCRIPT_DIR/nginx/iso-support-app.conf"

    if [ ! -f "$TEMPLATE" ]; then
        print_error "Template not found: $TEMPLATE"
        exit 1
    fi

    # Backup existing conf if present
    if [ -f "$NGINX_CONF" ]; then
        sudo cp "$NGINX_CONF" "$NGINX_CONF.bak.$(date +%Y%m%d%H%M%S)"
    fi

    sudo cp "$TEMPLATE" "$NGINX_CONF"

    # Ensure cert paths match $DOMAIN if different from template default
    if [ -n "$DOMAIN" ] && [ "$DOMAIN" != "iso-report.northernthai.co.th" ]; then
        sudo sed -i "s|iso-report\\.northernthai\\.co\\.th|$DOMAIN|g" "$NGINX_CONF"
    fi

    print_success "Nginx configuration installed from template"
    
    # Test Nginx config
    print_step "3.2" "Testing Nginx configuration..."
    if nginx -t >> "$LOG_FILE" 2>&1; then
        print_success "Nginx configuration valid"
    else
        print_error "Nginx configuration invalid"
        exit 1
    fi
    
    # Reload Nginx
    print_step "3.3" "Reloading Nginx..."
    /etc/init.d/nginx reload >> "$LOG_FILE" 2>&1
    print_success "Nginx reloaded"
}

# ================================================
# PHASE 4: Monitoring & Backup
# ================================================
phase4() {
    print_header "PHASE 4: Monitoring & Backup"
    
    # Setup cron as www
    print_step "4.1" "Setting up cron jobs as www..."
    cd "$APP_DIR"
    chmod +x deploy/setup-cron.sh
    sudo -u www bash deploy/setup-cron.sh >> "$LOG_FILE" 2>&1
    print_success "Cron jobs configured"
    
    # Run initial monitoring check
    print_step "4.2" "Running initial health check..."
    cd "$APP_DIR"
    ./deploy/monitor.sh --json >> "$LOG_FILE" 2>&1
    print_success "Health check completed"
    
    # Run initial backup
    print_step "4.3" "Running initial backup..."
    ./deploy/backup.sh >> "$LOG_FILE" 2>&1
    print_success "Initial backup completed"
}

# ================================================
# PHASE 5: Verification
# ================================================
phase5() {
    print_header "PHASE 5: Verification"
    
    echo ""
    echo -e "${CYAN}Verifying all services...${NC}"
    echo ""
    
    # Check PM2
    echo -e "${BLUE}PM2 Status:${NC}"
    pm2 list
    
    # Check port 3001
    echo ""
    echo -e "${BLUE}Port 3001:${NC}"
    if curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:3001; then
        print_success "Application responding"
    else
        print_error "Application not responding"
    fi
    
    # Check Nginx
    echo ""
    echo -e "${BLUE}Nginx:${NC}"
    if nginx -t 2>&1 | grep -q "successful"; then
        print_success "Nginx configuration valid"
    else
        print_error "Nginx configuration invalid"
    fi
    
    # Check domain (if DNS is configured)
    echo ""
    echo -e "${BLUE}Domain ($DOMAIN):${NC}"
    if curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" -k "https://$DOMAIN" 2>/dev/null; then
        print_success "Domain accessible"
    else
        print_warning "Domain not accessible yet (DNS may need time to propagate)"
    fi
    
    # Show health check endpoint
    echo ""
    echo -e "${BLUE}Health Check:${NC}"
    curl -s "http://localhost:3001/api/health" | jq . 2>/dev/null || curl -s "http://localhost:3001/api/health"
    
    echo ""
}

# ================================================
# Summary
# ================================================
print_summary() {
    print_header "SETUP COMPLETE!"
    
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  ISO Support App is Ready!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "  ${BLUE}App URL:${NC}        https://$DOMAIN"
    echo -e "  ${BLUE}Local URL:${NC}      http://localhost:3001"
    echo -e "  ${BLUE}Health Check:${NC}   https://$DOMAIN/api/health"
    echo -e "  ${BLUE}App Directory:${NC}  $APP_DIR"
    echo -e "  ${BLUE}Log File:${NC}       $LOG_FILE"
    echo ""
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "  1. Point your domain DNS to $SERVER_IP"
    echo "  2. Wait 5-10 minutes for DNS propagation"
    echo "  3. Access https://$DOMAIN"
    echo ""
    echo -e "${YELLOW}Useful Commands:${NC}"
    echo "  pm2 status                    # Check app status"
    echo "  pm2 logs iso-support-app      # View logs"
    echo "  pm2 restart iso-support-app   # Restart app"
    echo "  ./deploy/monitor.sh           # Run health check"
    echo "  ./deploy/backup.sh            # Run backup"
    echo ""
}

# ================================================
# Main
# ================================================
main() {
    check_root
    
    echo ""
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}  ISO Support App - All-in-One Setup${NC}"
    echo -e "${CYAN}========================================${NC}"
    echo ""
    echo -e "  ${BLUE}Domain:${NC}    $DOMAIN"
    echo -e "  ${BLUE}Server IP:${NC} $SERVER_IP"
    echo -e "  ${BLUE}App Dir:${NC}   $APP_DIR"
    echo -e "  ${BLUE}Log File:${NC}  $LOG_FILE"
    echo ""
    
    read -p "Press Enter to continue or Ctrl+C to cancel..."
    
    phase1
    phase2
    phase3
    phase4
    phase5
    print_summary
}

main "$@"
