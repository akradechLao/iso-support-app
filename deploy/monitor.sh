#!/bin/bash
# ===========================================
# ISO Support App - Monitoring Script
# ===========================================
#
# วิธีใช้:
#   ./monitor.sh              # ตรวจสอบสถานะ
#   ./monitor.sh --json       # แสดงผลแบบ JSON
#   ./monitor.sh --watch      # ตรวจสอบทุก 10 วินาที
#

set -e

# Configuration
APP_NAME="iso-support-app"
APP_PORT=3001
HEALTH_URL="http://localhost:${APP_PORT}"
LOG_DIR="/www/wwwlogs"
ALERT_LOG="${LOG_DIR}/monitor-alerts.log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Functions
timestamp() {
    date '+%Y-%m-%d %H:%M:%S'
}

log_info() {
    echo -e "${BLUE}[$(timestamp)]${NC} ℹ️  $1"
}

log_ok() {
    echo -e "${GREEN}[$(timestamp)]${NC} ✅ $1"
}

log_warn() {
    echo -e "${YELLOW}[$(timestamp)]${NC} ⚠️  $1"
    echo "[$(timestamp)] WARNING: $1" >> "$ALERT_LOG" 2>/dev/null || true
}

log_error() {
    echo -e "${RED}[$(timestamp)]${NC} ❌ $1"
    echo "[$(timestamp)] ERROR: $1" >> "$ALERT_LOG" 2>/dev/null || true
}

log_header() {
    echo ""
    echo -e "${CYAN}══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}══════════════════════════════════════════════════════════════${NC}"
    echo ""
}

# ===========================================
# Check PM2 Status
# ===========================================

check_pm2() {
    log_header "PM2 Process Status"

    if ! command -v pm2 &> /dev/null; then
        log_error "PM2 is not installed"
        return 1
    fi

    PM2_STATUS=$(pm2 jlist 2>/dev/null || echo "[]")

    if echo "$PM2_STATUS" | grep -q "\"name\":\"${APP_NAME}\""; then
        APP_STATUS=$(echo "$PM2_STATUS" | grep -o "\"status\":\"[^\"]*\"" | head -1 | cut -d'"' -f4)
        APP_PID=$(echo "$PM2_STATUS" | grep -o "\"pid\":[0-9]*" | head -1 | cut -d':' -f2)
        APP_UPTIME=$(echo "$PM2_STATUS" | grep -o "\"pm_uptime\":[0-9]*" | head -1 | cut -d':' -f2)
        APP_MEMORY=$(echo "$PM2_STATUS" | grep -o "\"memory\":[0-9]*" | head -1 | cut -d':' -f2)
        APP_CPU=$(echo "$PM2_STATUS" | grep -o "\"cpu\":[0-9]*" | head -1 | cut -d':' -f2)

        if [ "$APP_STATUS" = "online" ]; then
            log_ok "App is running (PID: $APP_PID)"
        else
            log_error "App is not running (Status: $APP_STATUS)"
        fi

        # Memory
        if [ -n "$APP_MEMORY" ]; then
            MEMORY_MB=$((APP_MEMORY / 1024 / 1024))
            if [ "$MEMORY_MB" -gt 800 ]; then
                log_warn "High memory usage: ${MEMORY_MB}MB"
            else
                log_info "Memory usage: ${MEMORY_MB}MB"
            fi
        fi

        # Uptime
        if [ -n "$APP_UPTIME" ]; then
            UPTIME_SECONDS=$(( ($(date +%s) * 1000 - APP_UPTIME) / 1000 ))
            UPTIME_HOURS=$((UPTIME_SECONDS / 3600))
            UPTIME_MINUTES=$(( (UPTIME_SECONDS % 3600) / 60 ))
            log_info "Uptime: ${UPTIME_HOURS}h ${UPTIME_MINUTES}m"
        fi

        # CPU
        if [ -n "$APP_CPU" ]; then
            if [ "$APP_CPU" -gt 80 ]; then
                log_warn "High CPU usage: ${APP_CPU}%"
            else
                log_info "CPU usage: ${APP_CPU}%"
            fi
        fi
    else
        log_error "App '${APP_NAME}' not found in PM2"
        return 1
    fi
}

# ===========================================
# Check HTTP Health
# ===========================================

check_http() {
    log_header "HTTP Health Check"

    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 --max-time 10 "${HEALTH_URL}" 2>/dev/null || echo "000")
    RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" --connect-timeout 5 --max-time 10 "${HEALTH_URL}" 2>/dev/null || echo "0")

    if [ "$HTTP_CODE" = "200" ]; then
        log_ok "HTTP response: ${HTTP_CODE} (Response time: ${RESPONSE_TIME}s)"

        # Check response time
        RESPONSE_MS=$(echo "$RESPONSE_TIME" | awk '{printf "%.0f", $1 * 1000}')
        if [ "$RESPONSE_MS" -gt 3000 ]; then
            log_warn "Slow response time: ${RESPONSE_MS}ms"
        elif [ "$RESPONSE_MS" -gt 1000 ]; then
            log_info "Response time: ${RESPONSE_MS}ms"
        else
            log_ok "Fast response: ${RESPONSE_MS}ms"
        fi
    elif [ "$HTTP_CODE" = "000" ]; then
        log_error "Cannot connect to app (Connection refused)"
    else
        log_error "HTTP error: ${HTTP_CODE}"
    fi
}

# ===========================================
# Check Disk Space
# ===========================================

check_disk() {
    log_header "Disk Space"

    DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')

    if [ "$DISK_USAGE" -gt 90 ]; then
        log_error "Critical disk usage: ${DISK_USAGE}%"
    elif [ "$DISK_USAGE" -gt 75 ]; then
        log_warn "High disk usage: ${DISK_USAGE}%"
    else
        log_ok "Disk usage: ${DISK_USAGE}%"
    fi

    # Show disk details
    df -h / | awk 'NR==2 {printf "  Used: %s of %s (%s)\n", $3, $2, $5}'
}

# ===========================================
# Check Memory
# ===========================================

check_memory() {
    log_header "Memory Usage"

    TOTAL_MEM=$(free -m | awk 'NR==2 {print $2}')
    USED_MEM=$(free -m | awk 'NR==2 {print $3}')
    FREE_MEM=$(free -m | awk 'NR==2 {print $4}')
    MEM_PERCENT=$((USED_MEM * 100 / TOTAL_MEM))

    if [ "$MEM_PERCENT" -gt 90 ]; then
        log_error "Critical memory usage: ${MEM_PERCENT}%"
    elif [ "$MEM_PERCENT" -gt 75 ]; then
        log_warn "High memory usage: ${MEM_PERCENT}%"
    else
        log_ok "Memory usage: ${MEM_PERCENT}%"
    fi

    echo "  Total: ${TOTAL_MEM}MB | Used: ${USED_MEM}MB | Free: ${FREE_MEM}MB"
}

# ===========================================
# Check Nginx
# ===========================================

check_nginx() {
    log_header "Nginx Status"

    if systemctl is-active --quiet nginx 2>/dev/null || /etc/init.d/nginx status 2>/dev/null | grep -q "running"; then
        log_ok "Nginx is running"
    else
        log_error "Nginx is not running"
    fi

    # Test Nginx config
    if nginx -t 2>&1 | grep -q "successful"; then
        log_ok "Nginx config is valid"
    else
        log_warn "Nginx config has issues"
    fi
}

# ===========================================
# Check Log Errors
# ===========================================

check_logs() {
    log_header "Recent Errors"

    ERROR_COUNT=0

    # Check PM2 error log
    if [ -f "${LOG_DIR}/pm2-error.log" ]; then
        RECENT_ERRORS=$(tail -100 "${LOG_DIR}/pm2-error.log" 2>/dev/null | grep -i "error" | wc -l)
        if [ "$RECENT_ERRORS" -gt 0 ]; then
            log_warn "Found ${RECENT_ERRORS} errors in PM2 error log (last 100 lines)"
            ERROR_COUNT=$((ERROR_COUNT + RECENT_ERRORS))
        fi
    fi

    # Check Nginx error log
    if [ -f "${LOG_DIR}/iso-support-app-error.log" ]; then
        RECENT_ERRORS=$(tail -100 "${LOG_DIR}/iso-support-app-error.log" 2>/dev/null | grep -i "error" | wc -l)
        if [ "$RECENT_ERRORS" -gt 0 ]; then
            log_warn "Found ${RECENT_ERRORS} errors in Nginx log (last 100 lines)"
            ERROR_COUNT=$((ERROR_COUNT + RECENT_ERRORS))
        fi
    fi

    if [ "$ERROR_COUNT" -eq 0 ]; then
        log_ok "No recent errors found"
    fi
}

# ===========================================
# Summary
# ===========================================

print_summary() {
    log_header "📊 Monitoring Summary"

    echo -e "  App Name:     ${APP_NAME}"
    echo -e "  App Port:     ${APP_PORT}"
    echo -e "  Health URL:   ${HEALTH_URL}"
    echo -e "  Timestamp:    $(timestamp)"
    echo ""
}

# ===========================================
# JSON Output
# ===========================================

output_json() {
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "${HEALTH_URL}" 2>/dev/null || echo "000")
    RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" --connect-timeout 5 "${HEALTH_URL}" 2>/dev/null || echo "0")
    DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    MEM_PERCENT=$(free | awk 'NR==2 {printf "%.0f", $3/$2 * 100}')

    PM2_ONLINE="false"
    if pm2 jlist 2>/dev/null | grep -q "\"status\":\"online\""; then
        PM2_ONLINE="true"
    fi

    cat <<EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "app": {
    "name": "${APP_NAME}",
    "port": ${APP_PORT},
    "pm2_online": ${PM2_ONLINE},
    "http_status": ${HTTP_CODE},
    "response_time": "${RESPONSE_TIME}s"
  },
  "system": {
    "disk_usage_percent": ${DISK_USAGE},
    "memory_usage_percent": ${MEM_PERCENT}
  }
}
EOF
}

# ===========================================
# Watch Mode
# ===========================================

watch_mode() {
    log_info "Starting watch mode (Ctrl+C to stop)..."
    while true; do
        clear
        echo -e "${CYAN}ISO Support App - Monitoring Dashboard${NC}"
        echo -e "${CYAN}Updated: $(timestamp)${NC}"
        echo ""
        check_pm2
        check_http
        check_disk
        check_memory
        sleep 10
    done
}

# ===========================================
# Main
# ===========================================

main() {
    case "${1}" in
        --json)
            output_json
            ;;
        --watch)
            watch_mode
            ;;
        *)
            print_summary
            check_pm2
            check_http
            check_disk
            check_memory
            check_nginx
            check_logs

            echo ""
            log_info "Monitoring complete. Use --json for JSON output or --watch for live updates."
            echo ""
            ;;
    esac
}

main "$@"
