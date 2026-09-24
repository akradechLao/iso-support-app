# ISO Support App - Deployment Guide

## Directory Structure

```
/www/wwwroot/iso-support-app/
├── app/                    # Next.js application
│   ├── .next/              # Build output
│   ├── node_modules/       # Dependencies
│   ├── src/                # Source code
│   ├── public/             # Static files
│   ├── ecosystem.config.js # PM2 config
│   ├── package.json
│   └── ...
├── data/                   # Database
│   └── iso_progress.db     # SQLite database
├── deploy/                 # Deployment scripts
│   ├── deploy.sh           # Main deploy script
│   ├── backup.sh           # Backup script
│   ├── monitor.sh          # Monitoring script
│   ├── setup-server.sh     # Server setup
│   ├── setup-database.sh   # Database setup
│   ├── setup-cron.sh       # Cron setup
│   └── nginx/              # Nginx configs
└── ...
```

---

## Quick Start

### 1. Initial Server Setup

```bash
# SSH into server
ssh root@YOUR_SERVER_IP

# Run setup script
cd /www/wwwroot/iso-support-app
chmod +x deploy/setup-server.sh
sudo ./deploy/setup-server.sh
```

### 2. Setup Database

```bash
chmod +x deploy/setup-database.sh
./deploy/setup-database.sh
```

### 3. Setup Monitoring & Cron

```bash
chmod +x deploy/setup-cron.sh
./deploy/setup-cron.sh
```

### 4. Configure Nginx

```bash
# Copy Nginx config
cp deploy/nginx/iso-support-app.conf /www/server/panel/vhost/nginx/iso-report.northernthai.co.th.conf

# Edit domain name
nano /www/server/panel/vhost/nginx/iso-report.northernthai.co.th.conf

# Reload Nginx
/etc/init.d/nginx reload
```

---

## Available Scripts

### Deploy Script

```bash
# Full deployment
./deploy/deploy.sh

# Deploy to specific environment
./deploy/deploy.sh production
./deploy/deploy.sh staging
```

### Backup Script

```bash
# Full backup (app + database + config + logs)
./deploy/backup.sh

# Backup specific items
./deploy/backup.sh --app
./deploy/backup.sh --database
./deploy/backup.sh --config

# List backups
./deploy/backup.sh --list

# Restore from backup
./deploy/backup.sh --restore /www/wwwbackups/iso-support-app/20240101-020000

# Cleanup old backups
./deploy/backup.sh --cleanup
```

### Monitor Script

```bash
# Check all services
./deploy/monitor.sh

# JSON output
./deploy/monitor.sh --json

# Live watch mode
./deploy/monitor.sh --watch
```

### Database Script

```bash
# Setup SQLite (default)
./deploy/setup-database.sh

# Setup PostgreSQL
./deploy/setup-database.sh --postgresql

# Reset database
./deploy/setup-database.sh --reset

# Show status
./deploy/setup-database.sh --status

# Seed data only
./deploy/setup-setup-database.sh --seed
```

### Cron Setup

```bash
# Setup automated tasks
./deploy/setup-cron.sh

# List cron jobs
./deploy/setup-cron.sh --list

# Remove cron jobs
./deploy/setup-cron.sh --remove
```

---

## Monitoring Endpoints

The app provides built-in health check endpoints:

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Health check with status |
| `GET /api/stats` | System statistics |

### Example Response

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 86400,
  "environment": "production",
  "memory": {
    "rss": "150MB",
    "heapUsed": "80MB"
  }
}
```

---

## PM2 Commands

```bash
# Status
pm2 status

# Logs
pm2 logs iso-support-app

# Restart
pm2 restart iso-support-app

# Stop
pm2 stop iso-support-app

# Delete
pm2 delete iso-support-app

# Save process list
pm2 save

# Startup on boot
pm2 startup
```

---

## Nginx Commands

```bash
# Test config
nginx -t

# Reload
/etc/init.d/nginx reload

# Restart
/etc/init.d/nginx restart

# View logs
tail -f /www/wwwlogs/iso-support-app-access.log
tail -f /www/wwwlogs/iso-support-app-error.log
```

---

## Backup Schedule

| Task | Schedule | Command |
|------|----------|---------|
| Full backup | Daily 2:00 AM | `./deploy/backup.sh` |
| Cleanup old backups | Sunday 3:00 AM | `./deploy/backup.sh --cleanup` |
| Health check | Every 5 minutes | `./deploy/monitor.sh --json` |
| PM2 auto-restart | Every minute | `pm2 restart iso-support-app` |

---

## Environment Variables

Create `.env.local` in the app directory:

```bash
# App
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL=sqlite:///www/wwwroot/iso-support-app/data/iso_progress.db

# App URL
NEXT_PUBLIC_APP_URL=https://YOUR_DOMAIN.com
```

---

## Troubleshooting

### App won't start

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs iso-support-app

# Restart
pm2 restart iso-support-app
```

### Nginx 502 error

```bash
# Check if app is running
curl -I http://localhost:3001

# Check Nginx config
nginx -t

# Reload Nginx
/etc/init.d/nginx reload
```

### Database issues

```bash
# Check database status
./deploy/setup-database.sh --status

# Reset database
./deploy/setup-database.sh --reset
```

### Backup failed

```bash
# Check disk space
df -h

# Check backup logs
cat /www/wwwlogs/backup-*.log

# Manual backup
./deploy/backup.sh
```

---

## GitHub Actions CI/CD

The repository includes GitHub Actions workflows for automated deployment:

- **ci.yml**: Runs on PR/push - lint, typecheck, build
- **deploy.yml**: Runs on push to main/master - build & deploy
- **deploy-optimized.yml**: Optimized deployment with artifact

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `SERVER_HOST` | Server IP address |
| `SERVER_USER` | SSH username (usually `root`) |
| `SERVER_SSH_KEY` | SSH private key |

---

## Support

For issues or questions:
1. Check the monitoring dashboard: `./deploy/monitor.sh`
2. View logs: `pm2 logs iso-support-app`
3. Check backup status: `./deploy/backup.sh --list`
