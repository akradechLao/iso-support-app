#!/bin/bash
# ===========================================
# ISO Support App - Cron Setup Script
# ===========================================
#
# ตั้งค่า automated tasks (cron jobs)
#
# วิธีใช้:
#   ./setup-cron.sh              # ตั้งค่า cron ทั้งหมด
#   ./setup-cron.sh --remove     # ลบ cron ทั้งหมด
#   ./setup-cron.sh --list       # แสดง cron ที่ตั้งค่าแล้ว
#

set -e

# Configuration — run as www (not administrator)
DEPLOY_DIR="/www/wwwroot/iso-report.northernthai.co.th/deploy"
BACKUP_SCRIPT="${DEPLOY_DIR}/backup.sh"
MONITOR_SCRIPT="${DEPLOY_DIR}/monitor.sh"
RUN_AS="www"

if [ "$(id -un)" != "$RUN_AS" ]; then
  if [ "$(id -un)" = "root" ]; then
    exec sudo -u "$RUN_AS" -E bash "$0" "$@"
  fi
  echo "ERROR: run as $RUN_AS: sudo -u www bash $0"
  exit 1
fi

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

# ===========================================
# Setup Cron Jobs
# ===========================================

setup_cron() {
    log "Setting up cron jobs..."

    # Make scripts executable (ignore if not owner)
    chmod +x "$BACKUP_SCRIPT" 2>/dev/null || true
    chmod +x "$MONITOR_SCRIPT" 2>/dev/null || true

    # Create cron entries (no forced every-minute restart — monitor.sh alerts instead)
    CRON_ENTRIES="
# ===========================================
# ISO Support App - Automated Tasks
# ===========================================

# Daily backup at 2:00 AM
0 2 * * * ${BACKUP_SCRIPT} >> /www/wwwlogs/backup-\$(date +\%Y\%m\%d).log 2>&1

# Weekly backup cleanup (every Sunday at 3:00 AM)
0 3 * * 0 ${BACKUP_SCRIPT} --cleanup >> /www/wwwlogs/backup-cleanup-\$(date +\%Y\%m\%d).log 2>&1

# Health check every 5 minutes (log to file)
*/5 * * * * ${MONITOR_SCRIPT} --json >> /www/wwwlogs/health-check.log 2>&1
"

    # Add to crontab (preserve existing)
    (crontab -l 2>/dev/null || true; echo "$CRON_ENTRIES") | crontab -

    success "Cron jobs configured"
    echo ""
    echo "Configured cron jobs:"
    echo "  - Daily backup: 2:00 AM"
    echo "  - Weekly cleanup: Sunday 3:00 AM"
    echo "  - Health check: Every 5 minutes"
}

# ===========================================
# Remove Cron Jobs
# ===========================================

remove_cron() {
    log "Removing ISO Support App cron jobs..."

    # Get current crontab
    CURRENT_CRON=$(crontab -l 2>/dev/null || true)

    # Remove our entries
    NEW_CRON=$(echo "$CURRENT_CRON" | grep -v "ISO Support App" | grep -v "$BACKUP_SCRIPT" | grep -v "$MONITOR_SCRIPT" | grep -v "pm2 restart iso-support-app")

    # Apply
    echo "$NEW_CRON" | crontab -

    success "Cron jobs removed"
}

# ===========================================
# List Cron Jobs
# ===========================================

list_cron() {
    log "Current cron jobs:"
    echo ""
    crontab -l 2>/dev/null || echo "No cron jobs configured"
}

# ===========================================
# Main
# ===========================================

main() {
    case "${1}" in
        --remove)
            remove_cron
            ;;
        --list)
            list_cron
            ;;
        *)
            setup_cron
            ;;
    esac
}

main "$@"
