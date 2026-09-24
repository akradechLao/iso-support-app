#!/bin/bash
# ===========================================
# ISO Support App - Backup Script
# ===========================================
#
# วิธีใช้:
#   ./backup.sh                    # Backup ทั้งหมด
#   ./backup.sh --app              # Backup app เท่านั้น
#   ./backup.sh --database         # Backup database เท่านั้น
#   ./backup.sh --config           # Backup config เท่านั้น
#   ./backup.sh --restore FILE     # Restore from backup
#   ./backup.sh --list             # รายการ backups
#   ./backup.sh --cleanup          # ลบ backups เก่า
#

set -e

# App backup/restore must run as www; only nginx restore elevates via sudo
if [ "$(id -un)" != "www" ] && [ "$(id -un)" != "root" ]; then
    echo "Run as www: sudo -u www bash $0"
    exit 1
fi
if [ "$(id -un)" = "root" ]; then
    exec sudo -u www -E bash "$0" "$@"
fi

# Configuration
PROJECT_DIR="/www/wwwroot/iso-report.northernthai.co.th"
APP_DIR="${PROJECT_DIR}"
DB_DIR="${PROJECT_DIR}/data"
BACKUP_BASE="/www/wwwbackups/iso-report.northernthai.co.th"
BACKUP_DIR="${BACKUP_BASE}/$(date +%Y%m%d-%H%M%S)"
RETENTION_DAYS=30
MAX_BACKUPS=10

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
# Backup App Files
# ===========================================

backup_app() {
    log "Backing up application files..."

    mkdir -p "$BACKUP_DIR/app"

    # Backup source code
    cd "$PROJECT_DIR"
    tar -czf "$BACKUP_DIR/app/source-code.tar.gz" \
        --exclude='node_modules' \
        --exclude='.next' \
        --exclude='.git' \
        --exclude='data' \
        deploy/ \
        .github/ \
        docs/ \
        data/processed/ \
        data/raw/ \
        *.md \
        *.js \
        *.ts \
        *.json \
        *.mjs \
        .gitignore \
        .env.example \
        2>/dev/null || true

    success "Application files backed up"

    # Backup node_modules (optional - large)
    # tar -czf "$BACKUP_DIR/app/node-modules.tar.gz" -C app node_modules/

    # Backup .next build
    if [ -d "$APP_DIR/.next" ]; then
        tar -czf "$BACKUP_DIR/app/next-build.tar.gz" -C "$APP_DIR" .next/
        success "Next.js build backed up"
    fi
}

# ===========================================
# Backup Database
# ===========================================

backup_database() {
    log "Backing up database..."

    mkdir -p "$BACKUP_DIR/database"

    # SQLite backup
    DB_FILE="${DB_DIR}/iso_progress.db"
    if [ -f "$DB_FILE" ]; then
        sqlite3 "$DB_FILE" ".backup '$BACKUP_DIR/database/iso_progress.db'"
        success "SQLite database backed up"

        # Also create SQL dump
        sqlite3 "$DB_FILE" ".dump" > "$BACKUP_DIR/database/iso_progress-dump.sql"
        success "SQL dump created"
    else
        warning "SQLite database not found"
    fi

    # PostgreSQL backup (if available)
    if command -v pg_dump &> /dev/null && [ -n "${PGPASSWORD:-}" ]; then
        pg_dump -U iso_app -h localhost iso_progress > "$BACKUP_DIR/database/postgresql-dump.sql" 2>/dev/null || true
        if [ -s "$BACKUP_DIR/database/postgresql-dump.sql" ]; then
            success "PostgreSQL backup created"
        fi
    fi
}

# ===========================================
# Backup Configuration
# ===========================================

backup_config() {
    log "Backing up configuration files..."

    mkdir -p "$BACKUP_DIR/config"

    # Nginx config
    NGINX_CONF="/www/server/panel/vhost/nginx/iso-report.northernthai.co.th.conf"
    if [ -f "$NGINX_CONF" ]; then
        cp "$NGINX_CONF" "$BACKUP_DIR/config/iso-report.northernthai.co.th.conf"
        success "Nginx config backed up"
    fi

    # PM2 config
    if [ -f "$APP_DIR/ecosystem.config.js" ]; then
        cp "$APP_DIR/ecosystem.config.js" "$BACKUP_DIR/config/"
        success "PM2 config backed up"
    fi

    # Environment files
    for env_file in .env .env.local .env.production; do
        if [ -f "$APP_DIR/$env_file" ]; then
            cp "$APP_DIR/$env_file" "$BACKUP_DIR/config/"
        fi
    done
    success "Environment files backed up"

    # SSL certificates
    if [ -d "/www/server/panel/vhost/cert" ]; then
        tar -czf "$BACKUP_DIR/config/ssl-certs.tar.gz" -C /www/server/panel/vhost cert/
        success "SSL certificates backed up"
    fi

    # PM2 saved process list (www user)
    pm2 save --force 2>/dev/null || true
    if [ -f /home/www/.pm2/dump.pm2 ]; then
        cp /home/www/.pm2/dump.pm2 "$BACKUP_DIR/config/"
        success "PM2 process list backed up"
    fi
}

# ===========================================
# Backup Logs
# ===========================================

backup_logs() {
    log "Backing up logs..."

    mkdir -p "$BACKUP_DIR/logs"

    # PM2 logs
    if [ -f "/www/wwwlogs/pm2-out.log" ]; then
        cp "/www/wwwlogs/pm2-out.log" "$BACKUP_DIR/logs/"
    fi
    if [ -f "/www/wwwlogs/pm2-error.log" ]; then
        cp "/www/wwwlogs/pm2-error.log" "$BACKUP_DIR/logs/"
    fi

    # Nginx logs
    if [ -f "/www/wwwlogs/iso-support-app-access.log" ]; then
        tail -10000 "/www/wwwlogs/iso-support-app-access.log" > "$BACKUP_DIR/logs/access.log"
    fi
    if [ -f "/www/wwwlogs/iso-support-app-error.log" ]; then
        tail -10000 "/www/wwwlogs/iso-support-app-error.log" > "$BACKUP_DIR/logs/error.log"
    fi

    success "Logs backed up (last 10000 lines)"
}

# ===========================================
# Create Manifest
# ===========================================

create_manifest() {
    log "Creating backup manifest..."

    cat > "$BACKUP_DIR/manifest.json" << EOF
{
  "backup_date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "hostname": "$(hostname)",
  "app_version": "$(cd $APP_DIR && cat package.json 2>/dev/null | grep '"version"' | cut -d'"' -f4 || echo 'unknown')",
  "node_version": "$(node -v)",
  "pm2_version": "$(pm2 -v 2>/dev/null || echo 'unknown')",
  "contents": {
    "app_files": $(tar -tzf "$BACKUP_DIR/app/source-code.tar.gz" 2>/dev/null | wc -l || echo 0),
    "database": $(ls -la "$BACKUP_DIR/database/" 2>/dev/null | tail -n +2 | wc -l || echo 0),
    "config_files": $(ls -la "$BACKUP_DIR/config/" 2>/dev/null | tail -n +2 | wc -l || echo 0)
  },
  "size_bytes": $(du -sb "$BACKUP_DIR" | cut -f1)
}
EOF

    success "Manifest created"
}

# ===========================================
# Restore Backup
# ===========================================

restore_backup() {
    local BACKUP_FILE="$1"

    if [ ! -d "$BACKUP_FILE" ]; then
        error "Backup not found: $BACKUP_FILE"
    fi

    log "Restoring from: $BACKUP_FILE"

    # Confirm
    read -p "Are you sure you want to restore? This will overwrite current data. (y/N): " CONFIRM
    if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
        warning "Restore cancelled"
        exit 0
    fi

    # Stop app
    log "Stopping application..."
    pm2 stop iso-support-app 2>/dev/null || true

    # Restore app files
    if [ -f "$BACKUP_FILE/app/source-code.tar.gz" ]; then
        log "Restoring application files..."
        cd "$PROJECT_DIR"
        tar -xzf "$BACKUP_FILE/app/source-code.tar.gz"
        success "Application files restored"
    fi

    # Restore database
    if [ -f "$BACKUP_FILE/database/iso_progress.db" ]; then
        log "Restoring database..."
        mkdir -p "$DB_DIR"
        cp "$BACKUP_FILE/database/iso_progress.db" "$DB_DIR/"
        success "Database restored"
    fi

    # Restore config (needs root — only this step)
    RESTORE_CONF="$BACKUP_FILE/config/iso-report.northernthai.co.th.conf"
    if [ -f "$RESTORE_CONF" ]; then
        log "Restoring Nginx config (requires sudo)..."
        if sudo -n true 2>/dev/null; then
            sudo cp "$RESTORE_CONF" "/www/server/panel/vhost/nginx/iso-report.northernthai.co.th.conf"
            sudo nginx -t && sudo /etc/init.d/nginx reload
            success "Nginx config restored"
        else
            warning "Skip nginx restore — no passwordless sudo for www. Run as root:"
            echo "  sudo cp '$RESTORE_CONF' /www/server/panel/vhost/nginx/iso-report.northernthai.co.th.conf"
            echo "  sudo nginx -t && sudo /etc/init.d/nginx reload"
        fi
    fi

    # Install dependencies
    log "Installing dependencies..."
    cd "$APP_DIR"
    npm install
    success "Dependencies installed"

    # Start app
    log "Starting application (as www)..."
    export PM2_HOME=/home/www/.pm2
    pm2 start ecosystem.config.js
    pm2 save
    success "Application started"

    success "Restore complete!"
}

# ===========================================
# List Backups
# ===========================================

list_backups() {
    log "Available backups:"

    if [ ! -d "$BACKUP_BASE" ]; then
        warning "No backups found"
        return
    fi

    echo ""
    printf "%-30s %-10s %s\n" "BACKUP" "SIZE" "DATE"
    echo "------------------------------------------------------------"

    for dir in $(ls -dr "$BACKUP_BASE"/*/ 2>/dev/null); do
        BACKUP_NAME=$(basename "$dir")
        BACKUP_SIZE=$(du -sh "$dir" 2>/dev/null | cut -f1)
        BACKUP_DATE=$(echo "$BACKUP_NAME" | sed 's/-/ /' | awk '{print $1}' | sed 's/\(....\)\(..\)\(..\)/\1-\2-\3/')
        printf "%-30s %-10s %s\n" "$BACKUP_NAME" "$BACKUP_SIZE" "$BACKUP_DATE"
    done

    echo ""
    TOTAL_SIZE=$(du -sh "$BACKUP_BASE" 2>/dev/null | cut -f1)
    TOTAL_COUNT=$(ls -d "$BACKUP_BASE"/*/ 2>/dev/null | wc -l)
    echo "Total: $TOTAL_COUNT backups ($TOTAL_SIZE)"
}

# ===========================================
# Cleanup Old Backups
# ===========================================

cleanup_backups() {
    log "Cleaning up old backups..."

    if [ ! -d "$BACKUP_BASE" ]; then
        warning "No backups to clean"
        return
    fi

    # Count before
    BEFORE=$(ls -d "$BACKUP_BASE"/*/ 2>/dev/null | wc -l)

    # Remove by age
    find "$BACKUP_BASE" -maxdepth 1 -type d -mtime +$RETENTION_DAYS -exec rm -rf {} \; 2>/dev/null || true

    # Remove by count (keep last MAX_BACKUPS)
    ls -dt "$BACKUP_BASE"/*/ 2>/dev/null | tail -n +$((MAX_BACKUPS + 1)) | xargs rm -rf 2>/dev/null || true

    # Count after
    AFTER=$(ls -d "$BACKUP_BASE"/*/ 2>/dev/null | wc -l)
    REMOVED=$((BEFORE - AFTER))

    if [ "$REMOVED" -gt 0 ]; then
        success "Removed $REMOVED old backups (kept $AFTER)"
    else
        log "No old backups to remove"
    fi
}

# ===========================================
# Main
# ===========================================

main() {
    case "${1}" in
        --app)
            backup_app
            ;;
        --database)
            backup_database
            ;;
        --config)
            backup_config
            ;;
        --restore)
            if [ -z "${2}" ]; then
                error "Please specify backup to restore: ./backup.sh --restore <backup-directory>"
            fi
            restore_backup "$2"
            ;;
        --list)
            list_backups
            ;;
        --cleanup)
            cleanup_backups
            ;;
        *)
            log "Starting full backup..."
            backup_app
            backup_database
            backup_config
            backup_logs
            create_manifest

            # Show summary
            BACKUP_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
            echo ""
            success "Backup complete!"
            echo ""
            echo "  Location: $BACKUP_DIR"
            echo "  Size:     $BACKUP_SIZE"
            echo ""
            echo "  Commands:"
            echo "    List backups:    ./backup.sh --list"
            echo "    Restore:         ./backup.sh --restore $BACKUP_DIR"
            echo "    Cleanup old:     ./backup.sh --cleanup"
            echo ""
            ;;
    esac
}

main "$@"
