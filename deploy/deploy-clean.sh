#!/bin/bash
# Deploy ISO Progress App - clean rebuild (fixes missing _next/static chunks)
# MUST run as www (aaPanel convention) — re-exec as www if needed
set -euo pipefail

APP_DIR="/www/wwwroot/iso-report.northernthai.co.th"
PM2_NAME="iso-support-app"
PORT=3001
RUN_AS="www"

if [ "$(id -un)" != "$RUN_AS" ]; then
  if [ "$(id -un)" = "root" ]; then
    exec sudo -u "$RUN_AS" -E bash "$0" "$@"
  fi
  if command -v sudo >/dev/null 2>&1 && sudo -n true 2>/dev/null; then
    exec sudo -u "$RUN_AS" -E bash "$0" "$@"
  fi
  echo "ERROR: must run as '$RUN_AS' (current: $(id -un))"
  echo "  sudo -u www -i  then re-run, or: sudo bash $0"
  exit 1
fi

free_port() {
  local pids=""
  if command -v fuser >/dev/null 2>&1; then
    pids=$(fuser -n tcp "$PORT" 2>/dev/null | tr -s ' ' '\n' | grep -E '^[0-9]+$' || true)
  fi
  if [ -z "$pids" ] && command -v lsof >/dev/null 2>&1; then
    pids=$(lsof -ti ":$PORT" -sTCP:LISTEN 2>/dev/null || true)
  fi
  if [ -z "$pids" ]; then
    pids=$(ss -ltnp "sport = :$PORT" 2>/dev/null | grep -oE 'pid=[0-9]+' | cut -d= -f2 | sort -u || true)
  fi
  if [ -n "$pids" ]; then
    echo "Killing PIDs on port $PORT: $pids"
    # shellcheck disable=SC2086
    kill -9 $pids 2>/dev/null || true
    sleep 1
  fi
  sleep 1

  if ss -ltn "sport = :$PORT" | grep -q LISTEN; then
    echo "FAIL: port $PORT still in use"
    ss -ltnp "sport = :$PORT" || true
    exit 1
  fi
  echo "Port $PORT is free (user=$(id -un))"
}

echo "=== 1) Stop app and free port ==="
pm2 stop "$PM2_NAME" 2>/dev/null || true
pm2 delete "$PM2_NAME" 2>/dev/null || true
free_port

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

echo "=== 6) Ensure port free before start ==="
free_port

echo "=== 7) Start PM2 ==="
cd "$APP_DIR"
pm2 start ecosystem.config.js
pm2 save

echo "=== 8) Health check ==="
# wait for listen
for i in $(seq 1 15); do
  if ss -ltn "sport = :$PORT" | grep -q LISTEN; then
    break
  fi
  sleep 1
done

if ! ss -ltn "sport = :$PORT" | grep -q LISTEN; then
  echo "FAIL: port $PORT not listening after start"
  pm2 logs "$PM2_NAME" --lines 40 --nostream || true
  exit 1
fi

# confirm owner is our pm2 app (best-effort)
ss -ltnp "sport = :$PORT" || true

code=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:$PORT/dashboard" || true)
echo "local /dashboard -> $code"
if [ "$code" != "200" ]; then
  echo "WARN: health not 200; check pm2 logs"
  pm2 logs "$PM2_NAME" --lines 40 --nostream || true
  exit 1
fi

# verify a previously-problematic static chunk serves 200
sample_css=$(find .next/static/chunks -name '*.css' | head -1 || true)
if [ -n "$sample_css" ]; then
  b=$(basename "$sample_css")
  sc=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:$PORT/_next/static/chunks/$b" || true)
  echo "local /_next/static/chunks/$b -> $sc"
  if [ "$sc" != "200" ]; then
    echo "FAIL: static CSS not served"
    exit 1
  fi
fi

sample_js=$(find .next/static/chunks -name '*.js' | head -1 || true)
if [ -n "$sample_js" ]; then
  b=$(basename "$sample_js")
  sj=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:$PORT/_next/static/chunks/$b" || true)
  echo "local /_next/static/chunks/$b -> $sj"
  if [ "$sj" != "200" ]; then
    echo "FAIL: static JS not served"
    exit 1
  fi
fi

echo "=== DONE. Purge Cloudflare cache for iso-report.northernthai.co.th ==="
