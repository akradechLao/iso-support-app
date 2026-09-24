#!/bin/bash
# ================================================
# ISO Support App - Verification Script
# ================================================
# Usage: ./verify.sh
# ================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Counters
TOTAL=0
PASSED=0
FAILED=0

# Functions
print_header() {
    echo ""
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}========================================${NC}"
    echo ""
}

check() {
    TOTAL=$((TOTAL + 1))
    local description="$1"
    local command="$2"
    
    if eval "$command" > /dev/null 2>&1; then
        echo -e "  ${GREEN}✓${NC} $description"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "  ${RED}✗${NC} $description"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# ================================================
# Main Verification
# ================================================
main() {
    print_header "ISO Support App - Verification"
    
    echo -e "${BLUE}Checking system requirements...${NC}"
    echo ""
    
    # System checks
    echo -e "${YELLOW}System:${NC}"
    check "Node.js installed" "command -v node"
    check "npm installed" "command -v npm"
    check "Git installed" "command -v git"
    check "PM2 installed" "command -v pm2"
    check "SQLite installed" "command -v sqlite3"
    echo ""
    
    # App checks
    echo -e "${YELLOW}Application:${NC}"
    check "App directory exists" "[ -d '/www/wwwroot/iso-report.northernthai.co.th' ]"
    check "node_modules exists" "[ -d '/www/wwwroot/iso-report.northernthai.co.th/node_modules' ]"
    check ".next build exists" "[ -d '/www/wwwroot/iso-report.northernthai.co.th/.next' ]"
    check "ecosystem.config.js exists" "[ -f '/www/wwwroot/iso-report.northernthai.co.th/ecosystem.config.js' ]"
    echo ""
    
    # PM2 checks
    echo -e "${YELLOW}PM2:${NC}"
    check "PM2 process running" "pm2 list | grep -q 'iso-support-app'"
    check "PM2 app online" "pm2 list | grep 'iso-support-app' | grep -q 'online'"
    echo ""
    
    # Port checks
    echo -e "${YELLOW}Network:${NC}"
    check "Port 3001 responding" "curl -s -o /dev/null -w '%{http_code}' http://localhost:3001 | grep -q '200'"
    check "Health endpoint working" "curl -s http://localhost:3001/api/health | grep -q 'healthy'"
    echo ""
    
    # Nginx checks
    echo -e "${YELLOW}Nginx:${NC}"
    check "Nginx installed" "command -v nginx"
    check "Nginx config valid" "nginx -t"
    check "Nginx running" "ps aux | grep -q '[n]ginx'"
    echo ""
    
    # Database checks
    echo -e "${YELLOW}Database:${NC}"
    check "SQLite database exists" "[ -f '/www/wwwroot/iso-report.northernthai.co.th/data/iso_progress.db' ]"
    check "Database accessible" "sqlite3 /www/wwwroot/iso-report.northernthai.co.th/data/iso_progress.db '.tables'"
    echo ""
    
    # Deploy scripts
    echo -e "${YELLOW}Deploy Scripts:${NC}"
    check "monitor.sh exists" "[ -f '/www/wwwroot/iso-report.northernthai.co.th/deploy/monitor.sh' ]"
    check "backup.sh exists" "[ -f '/www/wwwroot/iso-report.northernthai.co.th/deploy/backup.sh' ]"
    check "setup-database.sh exists" "[ -f '/www/wwwroot/iso-report.northernthai.co.th/deploy/setup-database.sh' ]"
    check "setup-cron.sh exists" "[ -f '/www/wwwroot/iso-report.northernthai.co.th/deploy/setup-cron.sh' ]"
    echo ""
    
    # Summary
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}  Verification Summary${NC}"
    echo -e "${CYAN}========================================${NC}"
    echo ""
    echo -e "  Total checks: ${BLUE}$TOTAL${NC}"
    echo -e "  Passed:       ${GREEN}$PASSED${NC}"
    echo -e "  Failed:       ${RED}$FAILED${NC}"
    echo ""
    
    if [ $FAILED -eq 0 ]; then
        echo -e "${GREEN}  ✓ All checks passed!${NC}"
        echo ""
        echo -e "${YELLOW}  Your ISO Support App is ready!${NC}"
        echo ""
        echo -e "  Access: https://iso-report.northernthai.co.th"
        echo ""
        return 0
    else
        echo -e "${RED}  ✗ Some checks failed${NC}"
        echo ""
        echo -e "${YELLOW}  Please fix the issues above and run this script again.${NC}"
        echo ""
        return 1
    fi
}

main "$@"
