# ===========================================
# ISO Support App - AaPanel Setup Guide
# ===========================================

## ตั้งค่า AaPanel สำหรับ ISO Support App

### 1. ติดตั้ง Node.js Version Manager

1. เข้า AaPanel → **App Store**
2. ค้นหา **"Node.js Version Manager"**
3. Click **Install**
4. เข้า **Settings** → ติดตั้ง Node.js v24.13.0

---

### 2. Upload โค้ดขึ้น Server

```bash
# SSH เข้า server
ssh root@YOUR_SERVER_IP

# Clone โค้ด
cd /www/wwwroot
git clone https://github.com/akradechLao/iso-support-app.git iso-support-app

# Install dependencies & build
cd /www/wwwroot/iso-support-app/app
npm install
npm run build
```

---

### 3. ตั้งค่า Node Project ใน AaPanel

1. เข้า AaPanel → **Website** → **Node Project** → **Add Node Project**
2. ตั้งค่า:

| Field | ค่า |
|-------|------|
| **Project Path** | `/www/wwwroot/iso-support-app/app` |
| **Project Name** | `iso-support-app` |
| **Node Version** | `v24.13.0` |
| **Run Command** | `npm start` |
| **Port** | `3001` |
| **User** | `www` |
| **Startup File** | `node_modules/next/dist/bin/next` |
| **Run Directory** | `/www/wwwroot/iso-support-app/app` |
| **Cluster Count** | `1` |
| **Memory Limit** | `1024` (MB) |
| **Package Manager** | `npm` |

3. Click **Submit** → **Start**

---

### 4. ตั้งค่า Domain ใน AaPanel

1. เข้า AaPanel → **Website** → **Add Site**
2. ตั้งค่า:

| Field | ค่า |
|-------|------|
| **Domain** | `YOUR_DOMAIN.com` |
| **Secondary Domain** | `www.YOUR_DOMAIN.com` |
| **Root Directory** | `/www/wwwroot/iso-support-app/app` |
| **PHP Version** | ไม่ต้องเลือก |
| **SSL** | เลือก **Let's Encrypt** |

---

### 5. ตั้งค่า SSL Certificate

1. เข้า AaPanel → **Website** → เลือก domain → **SSL** tab
2. เลือก **Let's Encrypt**
3. เลือก domain ที่ต้องการ
4. Click **Apply**
5. เปิด **Force HTTPS**

---

### 6. ตั้งค่า Nginx Reverse Proxy

สร้างไฟล์ config:

```bash
nano /www/server/panel/vhost/nginx/iso-report.northernthai.co.th.conf
```

คัดลอกเนื้อหาจากไฟล์ `deploy/nginx/iso-support-app.conf`

แก้ไข:
- `YOUR_DOMAIN.com` → domain จริง
- Path ของ SSL certificate

Reload Nginx:

```bash
/etc/init.d/nginx reload
```

---

### 7. ตั้งค่า Firewall

1. เข้า AaPanel → **Security** → **Firewall**
2. เปิด ports:

| Port | Protocol | หมายเหตุ |
|------|----------|----------|
| 80 | TCP | HTTP |
| 443 | TCP | HTTPS |
| 8888 | TCP | AaPanel |

---

### 8. ตั้งค่า Domain DNS

ตั้งค่าใน Domain Registrar:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | SERVER_IP | 300 |
| A | www | SERVER_IP | 300 |

---

### 9. ตั้งค่า GitHub Secrets

เข้า GitHub → **Settings** → **Secrets and variables** → **Actions**:

| Secret Name | ค่า |
|-------------|------|
| `SERVER_HOST` | `YOUR_SERVER_IP` |
| `SERVER_USER` | `root` |
| `SERVER_SSH_KEY` | SSH private key |

---

### 10. สร้าง SSH Key สำหรับ GitHub Actions

```bash
# บน server
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy_key

# สำเนา public key
cat ~/.ssh/github_deploy_key.pub >> ~/.ssh/authorized_keys

# สำเนา private key ไปตั้งค่าใน GitHub Secrets
cat ~/.ssh/github_deploy_key
```

---

### 11. Deploy

Push โค้ดขึ้น GitHub:

```bash
git add .
git commit -m "deploy: initial deployment"
git push origin master
```

GitHub Actions จะ auto-deploy ให้ทันที!

---

### 12. ตรวจสอบผลลัพธ์

```bash
# SSH เข้า server
ssh root@YOUR_SERVER_IP

# ดู PM2 status
pm2 status

# ดู logs
pm2 logs iso-support-app

# ทดสอบ app
curl -I http://localhost:3001
curl -I https://YOUR_DOMAIN.com
```

---

## Quick Commands

```bash
# Deploy update
cd /www/wwwroot/iso-support-app
./deploy/deploy.sh

# Restart app
pm2 restart iso-support-app

# View logs
pm2 logs iso-support-app

# Reload Nginx
/etc/init.d/nginx reload
```
