# Deployment Guide

Complete guide for deploying the NOC Email Report Generator to production environments.

---

## Table of Contents

1. [Deployment Options](#deployment-options)
2. [Vercel Deployment](#vercel-deployment)
3. [Docker Deployment](#docker-deployment)
4. [VPS Deployment (Ubuntu)](#vps-deployment-ubuntu)
5. [Environment Configuration](#environment-configuration)
6. [Post-Deployment](#post-deployment)
7. [Monitoring](#monitoring)
8. [Rollback Procedures](#rollback-procedures)

---

## Deployment Options

### Supported Platforms

| Platform | Complexity | Cost | Best For |
|----------|------------|------|----------|
| **Vercel** | Low | Free tier available | Quick deployment, serverless |
| **Docker** | Medium | Variable | Containerized, portable |
| **VPS (Ubuntu)** | High | $5-50/month | Full control, custom setup |

---

## Vercel Deployment

### Prerequisites

- Vercel account (bscplcipt@google.com)
- GitHub repository access
- MongoDB Atlas or external MongoDB

### Step 1: Prepare Repository

```bash
# Ensure latest code is pushed
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Step 2: Configure Vercel Project

1. **Sign in to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub (bscplcipt@google.com)

2. **Import Project**
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Select repository: `NOCREPORTIIG`

3. **Configure Build Settings**
   - **Framework Preset:** Next.js
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`
   - **Node Version:** 20.x

4. **Environment Variables**
   
   Add the following in Vercel dashboard:

   ```
   NODE_ENV=production
   NEXTAUTH_URL=https://your-vercel-app.vercel.app
   NEXTAUTH_SECRET=<generate-secure-secret>
   
   AZURE_AD_TENANT_ID=<your-tenant-id>
   AZURE_AD_CLIENT_ID=<your-client-id>
   AZURE_AD_CLIENT_SECRET=<your-client-secret>
   
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/noc-reports
   
   GRAPH_API_ENDPOINT=https://graph.microsoft.com/v1.0
   
   ENCRYPTION_KEY=<generate-secure-key>
   
   DEFAULT_TIMEZONE=Asia/Dhaka
   SESSION_MAX_AGE=86400
   MAX_EXPORT_ROWS=10000
   PDF_LOGO_URL=/logo.png
   ```

   **Generate secrets:**
   ```bash
   # NEXTAUTH_SECRET
   openssl rand -base64 32
   
   # ENCRYPTION_KEY
   openssl rand -hex 32
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-5 minutes)
   - Vercel URL will be provided

### Step 3: Configure Azure AD Redirect URI

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to Azure AD → App registrations
3. Select your app
4. Go to Authentication
5. Add redirect URI:
   ```
   https://your-vercel-app.vercel.app/api/auth/callback/microsoft
   ```
6. Save changes

### Step 4: Configure Custom Domain (Optional)

1. In Vercel dashboard, go to "Domains"
2. Add your custom domain
3. Configure DNS records as instructed:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```
4. Update `NEXTAUTH_URL` environment variable
5. Update Azure AD redirect URI

### Step 5: Test Deployment

1. Visit your Vercel URL
2. Test sign-in flow
3. Fetch emails
4. Generate report
5. Test export functionality

### Vercel-Specific Configuration

**vercel.json** (optional):

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 60
    }
  }
}
```

### Continuous Deployment

Vercel automatically deploys on:
- Push to `main` branch → Production
- Push to other branches → Preview deployments
- Pull requests → Preview deployments

**Disable auto-deploy (if needed):**
1. Project Settings → Git
2. Uncheck "Automatically deploy"

---

## Docker Deployment

### Prerequisites

- Docker 24.x+
- Docker Compose
- MongoDB (Atlas or container)

### Step 1: Create Dockerfile

Create `/Users/muminur/Desktop/NOCREPORTIIG/Dockerfile`:

```dockerfile
# Base image
FROM node:20-alpine AS base

# Dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build application
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Step 2: Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: noc-app
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - AZURE_AD_TENANT_ID=${AZURE_AD_TENANT_ID}
      - AZURE_AD_CLIENT_ID=${AZURE_AD_CLIENT_ID}
      - AZURE_AD_CLIENT_SECRET=${AZURE_AD_CLIENT_SECRET}
      - MONGODB_URI=${MONGODB_URI}
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
    depends_on:
      - mongodb
    networks:
      - noc-network

  mongodb:
    image: mongo:6.0
    container_name: noc-mongodb
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=root
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_ROOT_PASSWORD}
      - MONGO_INITDB_DATABASE=noc-reports
    volumes:
      - mongodb_data:/data/db
      - mongodb_config:/data/configdb
    networks:
      - noc-network

  nginx:
    image: nginx:alpine
    container_name: noc-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    networks:
      - noc-network

networks:
  noc-network:
    driver: bridge

volumes:
  mongodb_data:
  mongodb_config:
```

### Step 3: Create .env file

```bash
# .env
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=<generated-secret>

AZURE_AD_TENANT_ID=<your-tenant-id>
AZURE_AD_CLIENT_ID=<your-client-id>
AZURE_AD_CLIENT_SECRET=<your-client-secret>

MONGODB_URI=mongodb://root:password@mongodb:27017/noc-reports?authSource=admin
MONGO_ROOT_PASSWORD=<secure-password>

ENCRYPTION_KEY=<generated-key>

DEFAULT_TIMEZONE=Asia/Dhaka
SESSION_MAX_AGE=86400
```

### Step 4: Build and Run

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f app

# Check status
docker-compose ps
```

### Step 5: Initialize Database

```bash
# Access MongoDB container
docker exec -it noc-mongodb mongosh -u root -p <password> --authenticationDatabase admin

# Create indexes
use noc-reports
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ microsoftId: 1 }, { unique: true });
db.reports.createIndex({ userId: 1, date: -1 });
db.email_cache.createIndex({ userId: 1, emailId: 1 }, { unique: true });
db.email_cache.createIndex({ createdAt: 1 }, { expireAfterSeconds: 2592000 });
```

### Docker Management Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart application
docker-compose restart app

# View logs
docker-compose logs -f app

# Execute command in container
docker-compose exec app sh

# Rebuild and restart
docker-compose up -d --build

# Remove everything (including volumes)
docker-compose down -v
```

---

## VPS Deployment (Ubuntu)

### Prerequisites

- Ubuntu 22.04 LTS server
- Root or sudo access
- Domain name (optional)
- 4GB+ RAM recommended

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y build-essential curl git nginx certbot python3-certbot-nginx

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version  # v20.x.x
npm --version   # v10.x.x

# Install PM2
sudo npm install -g pm2
```

### Step 2: Install MongoDB

```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB
sudo apt update
sudo apt install -y mongodb-org

# Start and enable MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify
sudo systemctl status mongod
```

### Step 3: Configure MongoDB

```bash
# Access MongoDB
mongosh

# Create admin user
use admin
db.createUser({
  user: "admin",
  pwd: passwordPrompt(),
  roles: [ { role: "userAdminAnyDatabase", db: "admin" }, "readWriteAnyDatabase" ]
})

# Create application user
use noc-reports
db.createUser({
  user: "nocapp",
  pwd: passwordPrompt(),
  roles: [ { role: "readWrite", db: "noc-reports" } ]
})

# Exit
exit
```

```bash
# Enable authentication
sudo nano /etc/mongod.conf

# Add/uncomment:
security:
  authorization: enabled

# Restart MongoDB
sudo systemctl restart mongod
```

### Step 4: Deploy Application

```bash
# Create app directory
sudo mkdir -p /var/www/noc-app
sudo chown $USER:$USER /var/www/noc-app

# Clone repository
cd /var/www/noc-app
git clone <repository-url> .

# Install dependencies
npm install --production

# Create environment file
cp .env.example .env.local
nano .env.local
# (Edit with production values)

# Build application
npm run build
```

### Step 5: Configure PM2

```bash
# Create PM2 ecosystem file
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'noc-app',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/noc-app',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/noc-app/error.log',
    out_file: '/var/log/noc-app/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '1G',
  }]
};
```

```bash
# Create log directory
sudo mkdir -p /var/log/noc-app
sudo chown $USER:$USER /var/log/noc-app

# Start application
pm2 start ecosystem.config.js

# Configure PM2 to start on boot
pm2 startup
# (Run the command it outputs)
pm2 save
```

### Step 6: Configure Nginx

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/noc-app
```

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Increase client max body size
    client_max_body_size 50M;
    
    # Logs
    access_log /var/log/nginx/noc-app-access.log;
    error_log /var/log/nginx/noc-app-error.log;
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/noc-app /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 7: Configure SSL (Let's Encrypt)

```bash
# Obtain certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Follow prompts
# Choose: Redirect HTTP to HTTPS

# Verify auto-renewal
sudo certbot renew --dry-run
```

### Step 8: Configure Firewall

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Verify
sudo ufw status
```

### Step 9: Automatic Deployment Script

Create `/usr/local/bin/deploy-noc-app.sh`:

```bash
#!/bin/bash
# Automatic deployment script for NOC App

set -e

APP_DIR="/var/www/noc-app"
LOG_FILE="/var/log/noc-app/deploy.log"

echo "[$(date)] Starting deployment..." | tee -a $LOG_FILE

# Navigate to app directory
cd $APP_DIR

# Pull latest code
echo "[$(date)] Pulling latest code..." | tee -a $LOG_FILE
git pull origin main

# Install dependencies
echo "[$(date)] Installing dependencies..." | tee -a $LOG_FILE
npm install --production

# Build application
echo "[$(date)] Building application..." | tee -a $LOG_FILE
npm run build

# Restart application
echo "[$(date)] Restarting application..." | tee -a $LOG_FILE
pm2 reload noc-app

# Check status
pm2 status

echo "[$(date)] Deployment completed successfully!" | tee -a $LOG_FILE
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/deploy-noc-app.sh

# Run deployment
/usr/local/bin/deploy-noc-app.sh
```

---

## Environment Configuration

### Production Environment Variables

**Required Variables:**

```bash
# Application
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=<64-character-random-string>

# Azure AD
AZURE_AD_TENANT_ID=<azure-tenant-id>
AZURE_AD_CLIENT_ID=<azure-client-id>
AZURE_AD_CLIENT_SECRET=<azure-client-secret>

# MongoDB
MONGODB_URI=mongodb://user:pass@host:port/noc-reports?authSource=admin

# Microsoft Graph
GRAPH_API_ENDPOINT=https://graph.microsoft.com/v1.0

# Security
ENCRYPTION_KEY=<64-character-hex-string>

# Application Settings
DEFAULT_TIMEZONE=Asia/Dhaka
SESSION_MAX_AGE=86400
MAX_EXPORT_ROWS=10000
PDF_LOGO_URL=/logo.png
```

### Generating Secure Secrets

```bash
# NEXTAUTH_SECRET (base64, 32 bytes = 44 characters base64)
openssl rand -base64 32

# ENCRYPTION_KEY (hex, 32 bytes = 64 characters hex)
openssl rand -hex 32

# Strong password
openssl rand -base64 24
```

---

## Post-Deployment

### Verification Checklist

- [ ] Application is accessible at domain/URL
- [ ] SSL certificate is valid (HTTPS working)
- [ ] Sign-in with Microsoft works
- [ ] Email fetching works
- [ ] Report generation works
- [ ] Report editing and auto-save work
- [ ] XLSX export downloads correctly
- [ ] PDF export downloads correctly
- [ ] Statistics calculate correctly
- [ ] All API endpoints respond
- [ ] Error handling works properly
- [ ] Performance is acceptable (< 3s page load)
- [ ] MongoDB connection is stable
- [ ] Application restarts automatically

### Health Check Script

Create `/usr/local/bin/healthcheck-noc-app.sh`:

```bash
#!/bin/bash
# Health check script

URL="https://your-domain.com"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $URL)

if [ $STATUS -eq 200 ]; then
  echo "[$(date)] Health check PASSED - Status: $STATUS"
  exit 0
else
  echo "[$(date)] Health check FAILED - Status: $STATUS"
  # Restart application
  pm2 restart noc-app
  exit 1
fi
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/healthcheck-noc-app.sh

# Add to crontab (every 5 minutes)
crontab -e
# Add: */5 * * * * /usr/local/bin/healthcheck-noc-app.sh >> /var/log/noc-app/healthcheck.log 2>&1
```

---

## Monitoring

### Application Monitoring

**PM2 Monitoring:**

```bash
# Real-time monitoring
pm2 monit

# Status
pm2 status

# Logs
pm2 logs noc-app --lines 100
```

**PM2 Plus (Optional):**

```bash
# Register for PM2 Plus
pm2 plus

# Link application
pm2 link <secret-key> <public-key>
```

### Server Monitoring

**Install monitoring tools:**

```bash
# htop for resource monitoring
sudo apt install -y htop

# ncdu for disk usage
sudo apt install -y ncdu

# iftop for network monitoring
sudo apt install -y iftop
```

---

## Rollback Procedures

### Quick Rollback (Git)

```bash
# View recent commits
git log --oneline -10

# Rollback to previous commit
git reset --hard <commit-hash>

# Rebuild and restart
npm install --production
npm run build
pm2 restart noc-app
```

### Database Rollback

```bash
# Restore from backup
mongorestore --uri="mongodb://user:pass@host:port/noc-reports" /backups/backup_YYYYMMDD/noc-reports/
```

---

## Troubleshooting Common Issues

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed troubleshooting guide.

---

**Deployment Complete!** 🎉

Your NOC Email Report Generator is now live in production.

**Next Steps:**
- Monitor logs for errors
- Test all functionality
- Configure backups
- Set up monitoring alerts
- Train users

---

**Last Updated:** October 29, 2025

