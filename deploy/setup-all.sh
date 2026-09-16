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
APP_DIR="/www/wwwroot/iso-report-app.northernthai.co.th"
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
    
    # Enable PM2 startup
    pm2 startup systemd -u root --hp /root >> "$LOG_FILE" 2>&1
    print_success "PM2 startup configured"
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
        git clone https://github.com/akradechLao/iso-support-app.git iso-support-app >> "$LOG_FILE" 2>&1
        cd "$APP_DIR"
    fi
    print_success "Repository ready"
    
    # Install dependencies
    print_step "2.2" "Installing app dependencies..."
    cd "$APP_DIR"
    npm install >> "$LOG_FILE" 2>&1
    print_success "Dependencies installed"
    
    # Build application
    print_step "2.3" "Building application..."
    npm run build >> "$LOG_FILE" 2>&1
    print_success "Application built"
    
    # Setup database
    print_step "2.4" "Setting up database..."
    cd "$APP_DIR"
    chmod +x deploy/setup-database.sh
    ./deploy/setup-database.sh >> "$LOG_FILE" 2>&1
    print_success "Database ready"
    
    # Setup PM2
    print_step "2.5" "Starting application with PM2..."
    cd "$APP_DIR"
    pm2 delete iso-support-app 2>/dev/null || true
    pm2 start ecosystem.config.js >> "$LOG_FILE" 2>&1
    pm2 save >> "$LOG_FILE" 2>&1
    print_success "Application started"
    
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
    
    # Create Nginx config
    print_step "3.1" "Creating Nginx configuration..."
    
    NGINX_CONF="/www/server/panel/vhost/nginx/iso-report-app.northernthai.co.th.conf"
    
    cat > "$NGINX_CONF" <<EOF
# ISO Support App - Nginx Configuration
# Generated by setup-all.sh on $(date)

upstream iso_support_app {
    server 127.0.0.1:3001;
    keepalive 64;
}

# HTTP -> HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;
    
    # Redirect to HTTPS
    return 301 https://\$server_name\$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    # SSL Configuration
    ssl_certificate /www/server/panel/vhost/cert/$DOMAIN/fullchain.pem;
    ssl_certificate_key /www/server/panel/vhost/cert/$DOMAIN/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/xml+rss application/atom+xml image/svg+xml;

    # Proxy settings
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_cache_bypass \$http_upgrade;
    proxy_buffering off;
    proxy_request_buffering off;

    # Timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;

    # Static files caching
    location /_next/static/ {
        proxy_pass http://iso_support_app;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Health check endpoint
    location /api/health {
        proxy_pass http://iso_support_app;
        access_log off;
    }

    # Main application
    location / {
        proxy_pass http://iso_support_app;
    }

    # Deny access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF
    
    print_success "Nginx configuration created"
    
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
    
    # Setup cron jobs
    print_step "4.1" "Setting up cron jobs..."
    cd "$APP_DIR"
    chmod +x deploy/setup-cron.sh
    ./deploy/setup-cron.sh >> "$LOG_FILE" 2>&1
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
