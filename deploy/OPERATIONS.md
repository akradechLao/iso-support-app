# ISO Support App - Operations Guide

## Quick Start Commands

### Daily Operations

```bash
# Check app status
pm2 status

# View real-time logs
pm2 logs iso-support-app

# Restart app
pm2 restart iso-support-app

# Run health check
cd /www/wwwroot/iso-support-app
./deploy/monitor.sh
```

### Deployment

```bash
# Manual deployment
cd /www/wwwroot/iso-support-app
./deploy/deploy.sh

# Or push to GitHub (auto-deploy)
git push origin master
```

### Backup & Restore

```bash
# Full backup
./deploy/backup.sh

# List backups
./deploy/backup.sh --list

# Restore
./deploy/backup.sh --restore /www/wwwbackups/iso-support-app/YYYYMMDD-HHMMSS
```

### Monitoring

```bash
# Check all services
./deploy/monitor.sh

# JSON output
./deploy/monitor.sh --json

# Live watch mode
./deploy/monitor.sh --watch
```

---

## Monitoring Endpoints

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

## Cron Jobs

| Task | Schedule | Command |
|------|----------|---------|
| Full backup | Daily 2:00 AM | `./deploy/backup.sh` |
| Cleanup old backups | Sunday 3:00 AM | `./deploy/backup.sh --cleanup` |
| Health check | Every 5 minutes | `./deploy/monitor.sh --json` |
| PM2 auto-restart | Every minute | `pm2 restart iso-support-app` |

---

## Backup Schedule

| Backup Type | Retention | Location |
|-------------|-----------|----------|
| App | 7 days | `/www/wwwbackups/iso-support-app/` |
| Database | 30 days | `/www/wwwbackups/iso-support-app/` |
| Config | 30 days | `/www/wwwbackups/iso-support-app/` |
| Logs | 30 days | `/www/wwwbackups/iso-support-app/` |

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
4. Run verification: `./deploy/verify.sh`
