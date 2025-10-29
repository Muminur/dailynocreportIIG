# Administrator Guide

## Overview

This guide is for system administrators responsible for deploying, configuring, and maintaining the NOC Email Report Generator application.

---

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Installation & Setup](#installation--setup)
3. [Configuration](#configuration)
4. [User Management](#user-management)
5. [Monitoring & Maintenance](#monitoring--maintenance)
6. [Backup & Recovery](#backup--recovery)
7. [Troubleshooting](#troubleshooting)
8. [Security](#security)
9. [Performance Tuning](#performance-tuning)
10. [Updates & Upgrades](#updates--upgrades)

---

## System Requirements

### Server Requirements

**Minimum:**
- CPU: 2 cores
- RAM: 4GB
- Storage: 20GB SSD
- OS: Ubuntu 20.04+ / CentOS 8+ / Windows Server 2019+

**Recommended (Production):**
- CPU: 4+ cores
- RAM: 8GB+
- Storage: 50GB SSD
- OS: Ubuntu 22.04 LTS
- Network: 100Mbps+

### Software Dependencies

**Required:**
- Node.js: 20.x LTS or higher
- MongoDB: 6.0 or higher
- npm/yarn/pnpm: Latest stable
- Git: 2.x

**Optional:**
- Docker: 24.x (for containerized deployment)
- Nginx: 1.18+ (as reverse proxy)
- PM2: Latest (for process management)
- Certbot: Latest (for SSL certificates)

### External Services

**Required:**
- Microsoft Azure AD (for OAuth authentication)
- Microsoft Graph API access
- MongoDB Atlas or self-hosted MongoDB

**Optional:**
- Monitoring: Sentry, New Relic, DataDog
- Logging: ELK Stack, CloudWatch
- CDN: Cloudflare, AWS CloudFront

---

## Installation & Setup

### 1. Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show v10.x.x

# Install build tools
sudo apt install -y build-essential git
```

### 2. MongoDB Setup

**Option A: Local MongoDB**

```bash
# Install MongoDB 6.0
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify
sudo systemctl status mongod
```

**Option B: MongoDB Atlas (Recommended for Production)**

1. Create cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Configure network access (whitelist IP or allow from anywhere for testing)
3. Create database user
4. Get connection string
5. Save for environment configuration

### 3. Application Deployment

```bash
# Create application directory
sudo mkdir -p /var/www/noc-app
cd /var/www/noc-app

# Clone repository
git clone <repository-url> .

# Install dependencies
npm install --production

# Set appropriate permissions
sudo chown -R $USER:$USER /var/www/noc-app
```

### 4. Environment Configuration

```bash
# Create production environment file
cp .env.example .env.local

# Edit with production values
nano .env.local
```

**Required Environment Variables:**

```bash
# Application
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>

# Microsoft Azure AD
AZURE_AD_TENANT_ID=<your-tenant-id>
AZURE_AD_CLIENT_ID=<your-client-id>
AZURE_AD_CLIENT_SECRET=<your-client-secret>

# MongoDB
MONGODB_URI=mongodb://username:password@host:port/database
# Or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/database

# Microsoft Graph API
GRAPH_API_ENDPOINT=https://graph.microsoft.com/v1.0

# Encryption
ENCRYPTION_KEY=<generate-with-openssl-rand-hex-32>

# Timezone
DEFAULT_TIMEZONE=Asia/Dhaka

# Session
SESSION_MAX_AGE=86400

# Export Settings
MAX_EXPORT_ROWS=10000
PDF_LOGO_URL=/logo.png
```

**Generate Secure Keys:**

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate ENCRYPTION_KEY
openssl rand -hex 32
```

### 5. Database Initialization

```bash
# Initialize database indexes
npm run db:init

# Or manually via MongoDB shell
mongosh "mongodb://localhost:27017/noc-reports" --eval "
  db.users.createIndex({ email: 1 }, { unique: true });
  db.users.createIndex({ microsoftId: 1 }, { unique: true });
  db.reports.createIndex({ userId: 1, date: -1 });
  db.email_cache.createIndex({ userId: 1, emailId: 1 }, { unique: true });
  db.email_cache.createIndex({ createdAt: 1 }, { expireAfterSeconds: 2592000 });
"
```

### 6. Build Application

```bash
# Create production build
npm run build

# Verify build success
ls -la .next/
```

### 7. Process Management with PM2

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start application
pm2 start npm --name "noc-app" -- start

# Configure PM2 to start on boot
pm2 startup
pm2 save

# Check status
pm2 status
pm2 logs noc-app
```

### 8. Reverse Proxy with Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/noc-app
```

**Nginx Configuration:**

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL Configuration (use certbot for Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Proxy to Next.js application
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
    }

    # Increase client max body size (for large exports)
    client_max_body_size 50M;

    # Logging
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

### 9. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Verify auto-renewal
sudo certbot renew --dry-run
```

### 10. Firewall Configuration

```bash
# Configure UFW firewall
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Verify
sudo ufw status
```

---

## Configuration

### Azure AD Application Setup

1. **Register Application:**
   - Go to [Azure Portal](https://portal.azure.com)
   - Navigate to Azure Active Directory → App registrations
   - Click "New registration"
   - Name: "NOC Email Report Generator"
   - Supported account types: Single tenant
   - Redirect URI: `https://your-domain.com/api/auth/callback/microsoft`

2. **Configure API Permissions:**
   - Go to API permissions
   - Add permission → Microsoft Graph → Delegated permissions
   - Add: `Mail.Read`, `User.Read`, `offline_access`
   - Grant admin consent

3. **Create Client Secret:**
   - Go to Certificates & secrets
   - New client secret
   - Description: "NOC App Production"
   - Expires: 24 months (recommended)
   - Copy the secret value immediately
   - Save to `AZURE_AD_CLIENT_SECRET`

4. **Note Required Values:**
   - Application (client) ID → `AZURE_AD_CLIENT_ID`
   - Directory (tenant) ID → `AZURE_AD_TENANT_ID`
   - Client secret value → `AZURE_AD_CLIENT_SECRET`

### MongoDB Configuration

**Performance Tuning:**

```javascript
// MongoDB connection options in code
const options = {
  maxPoolSize: 10,
  minPoolSize: 2,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};
```

**Indexes:** (Already created during initialization)

```javascript
// Verify indexes
db.users.getIndexes();
db.reports.getIndexes();
db.email_cache.getIndexes();
```

### Application Configuration

**next.config.js** (already configured in codebase):

```javascript
module.exports = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};
```

---

## User Management

### User Authentication Flow

1. User clicks "Sign in with Microsoft"
2. Redirected to Microsoft OAuth
3. User authenticates with Microsoft
4. App receives authorization code
5. Exchanges code for access token
6. User profile created/updated in MongoDB
7. Session created with JWT
8. User redirected to dashboard

### User Data Structure

```javascript
{
  _id: ObjectId,
  email: "user@example.com",
  name: "John Doe",
  microsoftId: "...",
  accessToken: "<encrypted>",
  refreshToken: "<encrypted>",
  tokenExpiry: ISODate("2025-10-30T..."),
  lastLogin: ISODate("2025-10-29T..."),
  createdAt: ISODate("2025-10-01T..."),
  updatedAt: ISODate("2025-10-29T...")
}
```

### Managing Users

**View All Users:**

```javascript
// MongoDB shell
db.users.find({}, { email: 1, name: 1, lastLogin: 1 });
```

**Remove User:**

```javascript
// Remove user and all their data
db.users.deleteOne({ email: "user@example.com" });
db.reports.deleteMany({ userId: <user-object-id> });
db.email_cache.deleteMany({ userId: <user-object-id> });
```

**Check Active Sessions:**

```javascript
// Users logged in within last 24 hours
db.users.find({
  lastLogin: { $gte: new Date(Date.now() - 24*60*60*1000) }
});
```

---

## Monitoring & Maintenance

### Application Monitoring

**PM2 Monitoring:**

```bash
# Real-time monitoring
pm2 monit

# Application status
pm2 status

# View logs
pm2 logs noc-app
pm2 logs noc-app --lines 100

# Restart application
pm2 restart noc-app

# Reload without downtime
pm2 reload noc-app
```

**System Resources:**

```bash
# Check CPU, memory, disk
htop
df -h
free -m

# Check network
netstat -tuln | grep :3000
```

### Database Monitoring

**MongoDB Status:**

```bash
# Connect to MongoDB
mongosh "mongodb://localhost:27017/noc-reports"

# Database stats
db.stats();

# Collection stats
db.users.stats();
db.reports.stats();
db.email_cache.stats();

# Current operations
db.currentOp();

# Slow queries
db.system.profile.find({ millis: { $gt: 100 } }).sort({ ts: -1 });
```

**Database Size:**

```bash
# Disk usage
du -sh /var/lib/mongodb/

# Database size
mongosh --eval "db.stats(1024*1024)"  # Size in MB
```

### Log Management

**Application Logs:**

```bash
# PM2 logs location
~/.pm2/logs/

# View recent errors
pm2 logs noc-app --err --lines 50

# Clear old logs
pm2 flush
```

**Nginx Logs:**

```bash
# Access logs
sudo tail -f /var/log/nginx/noc-app-access.log

# Error logs
sudo tail -f /var/log/nginx/noc-app-error.log

# Analyze logs
sudo grep "POST /api" /var/log/nginx/noc-app-access.log | wc -l
```

**MongoDB Logs:**

```bash
# View MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Rotate logs
sudo logrotate /etc/logrotate.d/mongodb
```

### Health Checks

**Application Health:**

```bash
# Check if app is responding
curl -I https://your-domain.com/

# Check API health
curl https://your-domain.com/api/health

# Response time
curl -o /dev/null -s -w "Time: %{time_total}s\n" https://your-domain.com/
```

**MongoDB Health:**

```javascript
// MongoDB shell
db.serverStatus();
db.runCommand({ ping: 1 });
```

### Performance Metrics

**Key Metrics to Monitor:**

1. **Response Time:**
   - Homepage: < 2 seconds
   - Dashboard: < 3 seconds
   - API calls: < 500ms average

2. **Resource Usage:**
   - CPU: < 70% average
   - Memory: < 80% usage
   - Disk: < 80% full

3. **Database:**
   - Query time: < 100ms average
   - Connection pool: < 80% utilized
   - Slow queries: Monitor queries > 100ms

4. **Application:**
   - Uptime: > 99.9%
   - Error rate: < 1%
   - Active users: Track concurrent sessions

---

## Backup & Recovery

### Database Backup

**Automated Backup Script:**

```bash
#!/bin/bash
# Save as /usr/local/bin/backup-noc-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/noc-app"
DB_NAME="noc-reports"

# Create backup directory
mkdir -p $BACKUP_DIR

# Dump database
mongodump --uri="mongodb://localhost:27017/$DB_NAME" --out="$BACKUP_DIR/backup_$DATE"

# Compress backup
tar -czf "$BACKUP_DIR/backup_$DATE.tar.gz" "$BACKUP_DIR/backup_$DATE"
rm -rf "$BACKUP_DIR/backup_$DATE"

# Delete backups older than 30 days
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +30 -delete

echo "Backup completed: backup_$DATE.tar.gz"
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/backup-noc-db.sh

# Add to crontab (daily at 2 AM)
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-noc-db.sh
```

**Manual Backup:**

```bash
# Backup entire database
mongodump --uri="mongodb://localhost:27017/noc-reports" --out=/backups/manual_backup

# Backup specific collection
mongodump --uri="mongodb://localhost:27017/noc-reports" --collection=reports --out=/backups/reports_backup
```

### Database Restore

```bash
# Restore entire database
mongorestore --uri="mongodb://localhost:27017/noc-reports" /backups/manual_backup/noc-reports/

# Restore specific collection
mongorestore --uri="mongodb://localhost:27017/noc-reports" --collection=reports /backups/reports_backup/noc-reports/reports.bson
```

### Application Backup

```bash
# Backup application code and configuration
tar -czf /backups/noc-app_$(date +%Y%m%d).tar.gz \
  /var/www/noc-app \
  --exclude=node_modules \
  --exclude=.next

# Backup environment file (securely)
sudo cp /var/www/noc-app/.env.local /backups/.env.local_$(date +%Y%m%d).backup
sudo chmod 600 /backups/.env.local_*.backup
```

### Disaster Recovery Plan

**RTO (Recovery Time Objective):** 4 hours  
**RPO (Recovery Point Objective):** 24 hours (daily backups)

**Recovery Steps:**

1. **Provision new server** (if needed)
2. **Install dependencies** (Node.js, MongoDB, Nginx)
3. **Restore application code** from backup
4. **Restore database** from latest backup
5. **Configure environment variables**
6. **Start services** (MongoDB, PM2, Nginx)
7. **Verify functionality**
8. **Update DNS** (if server changed)

**Recovery Commands:**

```bash
# 1. Restore application
cd /var/www
sudo tar -xzf /backups/noc-app_YYYYMMDD.tar.gz

# 2. Restore environment
sudo cp /backups/.env.local_YYYYMMDD.backup /var/www/noc-app/.env.local

# 3. Install dependencies
cd /var/www/noc-app
npm install --production

# 4. Restore database
mongorestore --uri="mongodb://localhost:27017/noc-reports" /backups/backup_YYYYMMDD/noc-reports/

# 5. Build and start
npm run build
pm2 start npm --name "noc-app" -- start

# 6. Verify
curl https://your-domain.com/
```

---

## Troubleshooting

### Common Issues

#### Application Won't Start

**Symptoms:** PM2 shows app as "errored" or "stopped"

**Diagnosis:**

```bash
pm2 logs noc-app --err --lines 100
```

**Common Causes & Solutions:**

1. **Port already in use:**
   ```bash
   sudo lsof -i :3000
   sudo kill -9 <PID>
   pm2 restart noc-app
   ```

2. **Missing environment variables:**
   ```bash
   cat /var/www/noc-app/.env.local
   # Verify all required variables are present
   ```

3. **Build failed:**
   ```bash
   cd /var/www/noc-app
   npm run build
   # Check for errors
   ```

#### MongoDB Connection Issues

**Symptoms:** "MongoNetworkError" or "connection refused"

**Diagnosis:**

```bash
sudo systemctl status mongod
mongosh "mongodb://localhost:27017"
```

**Solutions:**

```bash
# Restart MongoDB
sudo systemctl restart mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Verify connection string in .env.local
```

#### High Memory Usage

**Symptoms:** System becomes slow, PM2 shows high memory

**Diagnosis:**

```bash
pm2 monit
free -m
top
```

**Solutions:**

```bash
# Restart application
pm2 restart noc-app

# Increase Node.js memory limit
pm2 delete noc-app
pm2 start npm --name "noc-app" --node-args="--max-old-space-size=4096" -- start

# Check for memory leaks (enable Node.js inspector)
```

#### Email Fetching Failures

**Symptoms:** Users report emails not fetching

**Diagnosis:**

1. Check Azure AD app permissions
2. Verify Microsoft Graph API access
3. Check user token expiry
4. Review API rate limits

**Solutions:**

```bash
# Check application logs
pm2 logs noc-app | grep "Graph API"

# Verify Azure AD configuration
# Ensure API permissions are granted
# Check for rate limiting (429 errors)
```

#### Slow Performance

**Symptoms:** Slow page loads, API timeouts

**Diagnosis:**

```bash
# Check system resources
htop
df -h

# Check MongoDB performance
mongosh --eval "db.currentOp()"

# Check slow queries
mongosh --eval "db.system.profile.find({millis:{\$gt:100}})"
```

**Solutions:**

1. **Optimize database:**
   ```javascript
   db.reports.createIndex({ userId: 1, date: -1 });
   db.email_cache.createIndex({ userId: 1, receivedDateTime: -1 });
   ```

2. **Clear old cache:**
   ```javascript
   db.email_cache.deleteMany({ 
     createdAt: { $lt: new Date(Date.now() - 30*24*60*60*1000) } 
   });
   ```

3. **Restart services:**
   ```bash
   pm2 restart noc-app
   sudo systemctl restart mongodb
   sudo systemctl restart nginx
   ```

---

## Security

### Security Best Practices

1. **Environment Variables:**
   - Never commit `.env.local` to version control
   - Use strong, random secrets
   - Rotate secrets regularly (every 90 days)

2. **SSL/TLS:**
   - Always use HTTPS in production
   - Keep SSL certificates up-to-date
   - Use TLS 1.2 or higher

3. **Access Control:**
   - Limit SSH access to specific IPs
   - Use SSH keys, disable password authentication
   - Implement firewall rules

4. **Database Security:**
   - Enable MongoDB authentication
   - Use strong database passwords
   - Restrict MongoDB to localhost (unless cluster)
   - Regular backups

5. **Application Security:**
   - Keep dependencies updated
   - Regular security audits: `npm audit`
   - Monitor for vulnerabilities
   - Implement rate limiting

### Security Audit

```bash
# Check for vulnerable dependencies
npm audit

# Fix automatically
npm audit fix

# Generate security report
npm audit --json > security-report.json
```

### Firewall Rules

```bash
# Secure SSH
sudo ufw limit 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Deny all other incoming
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Enable
sudo ufw enable
```

### Monitoring Security

**Check Auth Logs:**

```bash
# Failed login attempts
sudo grep "Failed password" /var/log/auth.log

# Successful logins
sudo grep "Accepted password" /var/log/auth.log
```

**Monitor Application Errors:**

```bash
# Check for suspicious activity
pm2 logs noc-app --err | grep -i "unauthorized\|forbidden\|authentication"
```

---

## Performance Tuning

### Node.js Optimization

```bash
# Increase memory limit
pm2 delete noc-app
pm2 start npm --name "noc-app" \
  --node-args="--max-old-space-size=4096" \
  -- start

# Enable cluster mode (multiple instances)
pm2 start npm --name "noc-app" -i max -- start
```

### MongoDB Optimization

```javascript
// Enable profiling for slow queries
db.setProfilingLevel(1, { slowms: 100 });

// View slow queries
db.system.profile.find({ millis: { $gt: 100 } }).sort({ ts: -1 });

// Analyze query performance
db.reports.find({ userId: ObjectId("...") }).explain("executionStats");
```

**Index Optimization:**

```javascript
// Check index usage
db.reports.aggregate([{ $indexStats: {} }]);

// Remove unused indexes (carefully!)
// db.collection.dropIndex("indexName");
```

### Nginx Optimization

```nginx
# Add to nginx configuration

# Enable gzip compression
gzip on;
gzip_vary on;
gzip_min_length 256;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

# Enable caching
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 7d;
    add_header Cache-Control "public, immutable";
}

# Enable HTTP/2
listen 443 ssl http2;
```

### Caching Strategy

**Browser Caching:** (Already configured in Next.js)

**Server-Side Caching:** Consider Redis for:
- Session storage
- API response caching
- Frequently accessed data

---

## Updates & Upgrades

### Application Updates

**Minor Updates (No breaking changes):**

```bash
# Pull latest code
cd /var/www/noc-app
git pull origin main

# Install new dependencies
npm install --production

# Rebuild
npm run build

# Reload without downtime
pm2 reload noc-app

# Verify
pm2 logs noc-app --lines 20
```

**Major Updates (Breaking changes):**

1. **Backup everything:**
   ```bash
   ./backup-noc-db.sh
   tar -czf /backups/app-backup.tar.gz /var/www/noc-app
   ```

2. **Test in staging environment first**

3. **Update in maintenance window:**
   ```bash
   # Stop application
   pm2 stop noc-app
   
   # Update code
   git pull origin main
   npm install --production
   npm run build
   
   # Run migrations (if any)
   # npm run migrate
   
   # Start application
   pm2 start noc-app
   ```

4. **Verify functionality**

5. **Monitor for issues**

### Dependency Updates

```bash
# Check outdated packages
npm outdated

# Update all dependencies
npm update

# Update specific package
npm update <package-name>

# Security updates
npm audit fix
```

### Database Migrations

If schema changes are required:

```javascript
// Example migration script
// migrations/001-add-field-to-reports.js

db.reports.updateMany(
  { newField: { $exists: false } },
  { $set: { newField: "default value" } }
);
```

Run migration:

```bash
mongosh "mongodb://localhost:27017/noc-reports" < migrations/001-add-field-to-reports.js
```

---

## Appendix

### Useful Commands Cheat Sheet

```bash
# Application Management
pm2 start noc-app
pm2 stop noc-app
pm2 restart noc-app
pm2 reload noc-app
pm2 logs noc-app
pm2 monit

# Database
mongosh "mongodb://localhost:27017/noc-reports"
mongodump --uri="..." --out=backup/
mongorestore --uri="..." backup/

# Nginx
sudo nginx -t
sudo systemctl restart nginx
sudo tail -f /var/log/nginx/noc-app-error.log

# System
sudo systemctl status mongod
htop
df -h
free -m
sudo ufw status

# Logs
pm2 logs noc-app --err
sudo tail -f /var/log/mongodb/mongod.log
sudo tail -f /var/log/nginx/noc-app-access.log
```

### Configuration Files Locations

```
/var/www/noc-app/                    # Application root
/var/www/noc-app/.env.local          # Environment variables
/etc/nginx/sites-available/noc-app   # Nginx config
/etc/systemd/system/mongod.service   # MongoDB service
~/.pm2/                              # PM2 data
/var/log/nginx/                      # Nginx logs
/var/log/mongodb/                    # MongoDB logs
/backups/                            # Backups directory
```

### Support Resources

- **Application Documentation:** `/docs` folder
- **MongoDB Docs:** https://docs.mongodb.com
- **Next.js Docs:** https://nextjs.org/docs
- **Nginx Docs:** https://nginx.org/en/docs/
- **PM2 Docs:** https://pm2.keymetrics.io/docs/

---

**Need Help?** Contact the development team or create an issue in the repository.

