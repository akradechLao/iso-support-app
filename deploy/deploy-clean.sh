#!/bin/bash
# Deploy ISO Progress App - clean rebuild (fixes missing _next/static chunks)
set -euo pipefail

APP_DIR="/www/wwwroot/iso-report-app.northernthai.co.th"
PM2_NAME="iso-support-app"

echo "=== 1) Stop app ==="
pm2 stop "$PM2_NAME" 2>/dev/null || true
# Kill any leftover next-server bound to 3001
pkill -f "next-server" 2>/dev/null || true
pkill -f "next start" 2>/dev/null || true
sleep 1

echo "=== 2) Git pull ==="
cd "$APP_DIR"
git pull origin master

echo "=== 3) Clean .next (critical for chunk 404s) ==="
rm -rf .next

echo "=== 4) Install + build ==="
cd "$APP_DIR"
npm ci --production=false
npm run build

echo "=== 5) Verify build artifacts ==="
test -f .next/BUILD_ID || { echo "FAIL: no BUILD_ID"; exit 1; }
JS_COUNT=$(find .next/static/chunks -name '*.js' | wc -l)
CSS_COUNT=$(find .next/static/chunks -name '*.css' | wc -l)
echo "BUILD_ID=$(cat .next/BUILD_ID) js=$JS_COUNT css=$CSS_COUNT"
if [ "$JS_COUNT" -lt 5 ] || [ "$CSS_COUNT" -lt 1 ]; then
  echo "FAIL: incomplete static chunks"
  exit 1
fi

# Verify every CSS referenced in server HTML exists
missing=0
while IFS= read -r css; do
  base=$(basename "$css")
  if [ ! -f ".next/static/chunks/$base" ]; then
    echo "MISSING referenced CSS: $base"
    missing=1
  fi
done < <(find .next/server/app -name '*.html' -exec grep -ohE '[A-Za-z0-9_-]+\.css' {} \; 2>/dev/null | sort -u || true)
if [ "$missing" -ne 0 ]; then
  echo "FAIL: referenced CSS missing after fix-css"
  exit 1
fi

echo "=== 6) Restart PM2 ==="
cd "$APP_DIR"
pm2 delete "$PM2_NAME" 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

echo "=== 7) Health check ==="
sleep 4
code=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3001/dashboard || true)
echo "local /dashboard -> $code"
if [ "$code" != "200" ]; then
  echo "WARN: health not 200 yet; check pm2 logs"
  pm2 logs "$PM2_NAME" --lines 40 --nostream || true
  exit 1
fi

echo "=== DONE. Purge Cloudflare cache for iso-report-app.northernthai.co.th ==="
