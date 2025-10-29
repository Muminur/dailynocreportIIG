#!/bin/bash
# NOC Email Report Generator - Ubuntu Server Deployment Script
# This script automates the deployment process on Ubuntu 22.04+ servers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="noc-app"
APP_DIR="/var/www/noc-app"
LOG_DIR="/var/log/noc-app"
BACKUP_DIR="/backups/noc-app"
NODE_VERSION="20"

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_root() {
    if [ "$EUID" -ne 0 ]; then 
        log_error "Please run as root or with sudo"
        exit 1
    fi
}

install_dependencies() {
    log_info "Installing system dependencies..."
    
    apt update
    apt install -y curl git build-essential nginx certbot python3-certbot-nginx
    
    log_info "Installing Node.js ${NODE_VERSION}..."
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt install -y nodejs
    
    log_info "Installing PM2..."
    npm install -g pm2
    
    log_info "Dependencies installed successfully!"
}

install_mongodb() {
    log_info "Installing MongoDB 6.0..."
    
    wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
    apt update
    apt install -y mongodb-org
    
    systemctl start mongod
    systemctl enable mongod
    
    log_info "MongoDB installed and started!"
}

setup_directories() {
    log_info "Setting up directories..."
    
    mkdir -p $APP_DIR
    mkdir -p $LOG_DIR
    mkdir -p $BACKUP_DIR
    
    chown $SUDO_USER:$SUDO_USER $APP_DIR
    chown $SUDO_USER:$SUDO_USER $LOG_DIR
    chown $SUDO_USER:$SUDO_USER $BACKUP_DIR
    
    log_info "Directories created!"
}

clone_repository() {
    log_info "Cloning repository..."
    
    if [ -d "$APP_DIR/.git" ]; then
        log_warn "Repository already exists, pulling latest changes..."
        cd $APP_DIR
        sudo -u $SUDO_USER git pull origin main
    else
        log_info "Enter repository URL:"
        read REPO_URL
        sudo -u $SUDO_USER git clone $REPO_URL $APP_DIR
    fi
    
    log_info "Repository cloned/updated!"
}

install_app_dependencies() {
    log_info "Installing application dependencies..."
    
    cd $APP_DIR
    sudo -u $SUDO_USER npm install --production
    
    log_info "Application dependencies installed!"
}

setup_environment() {
    log_info "Setting up environment variables..."
    
    if [ ! -f "$APP_DIR/.env.local" ]; then
        log_warn "Creating .env.local from example..."
        sudo -u $SUDO_USER cp $APP_DIR/.env.example $APP_DIR/.env.local
        
        log_warn "Please edit $APP_DIR/.env.local with your production values"
        log_warn "Press Enter to continue after editing..."
        read
    else
        log_info ".env.local already exists"
    fi
}

build_application() {
    log_info "Building application..."
    
    cd $APP_DIR
    sudo -u $SUDO_USER npm run build
    
    log_info "Application built successfully!"
}

setup_pm2() {
    log_info "Setting up PM2..."
    
    cd $APP_DIR
    
    # Stop existing process if running
    sudo -u $SUDO_USER pm2 delete $APP_NAME 2>/dev/null || true
    
    # Start application
    sudo -u $SUDO_USER pm2 start npm --name "$APP_NAME" -- start
    
    # Save PM2 configuration
    sudo -u $SUDO_USER pm2 save
    
    # Setup PM2 startup script
    env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $SUDO_USER --hp /home/$SUDO_USER
    
    log_info "PM2 configured and application started!"
}

configure_nginx() {
    log_info "Configuring Nginx..."
    
    log_info "Enter your domain name:"
    read DOMAIN_NAME
    
    cat > /etc/nginx/sites-available/$APP_NAME <<EOF
server {
    listen 80;
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    client_max_body_size 50M;
    
    access_log $LOG_DIR/nginx-access.log;
    error_log $LOG_DIR/nginx-error.log;
}
EOF
    
    # Enable site
    ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
    
    # Test configuration
    nginx -t
    
    # Restart Nginx
    systemctl restart nginx
    
    log_info "Nginx configured!"
}

setup_ssl() {
    log_info "Setting up SSL certificate..."
    
    log_info "Enter your email for Let's Encrypt:"
    read EMAIL
    
    log_info "Enter your domain name:"
    read DOMAIN_NAME
    
    certbot --nginx -d $DOMAIN_NAME -d www.$DOMAIN_NAME --email $EMAIL --agree-tos --no-eff-email
    
    log_info "SSL certificate installed!"
}

configure_firewall() {
    log_info "Configuring firewall..."
    
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable
    
    log_info "Firewall configured!"
}

setup_cron_backup() {
    log_info "Setting up automated backups..."
    
    cat > /usr/local/bin/backup-noc-app.sh <<'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/noc-app"
DB_NAME="noc-reports"

mkdir -p $BACKUP_DIR

# Dump database
mongodump --uri="mongodb://localhost:27017/$DB_NAME" --out="$BACKUP_DIR/backup_$DATE"

# Compress backup
tar -czf "$BACKUP_DIR/backup_$DATE.tar.gz" "$BACKUP_DIR/backup_$DATE"
rm -rf "$BACKUP_DIR/backup_$DATE"

# Delete backups older than 30 days
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +30 -delete

echo "[$(date)] Backup completed: backup_$DATE.tar.gz"
EOF
    
    chmod +x /usr/local/bin/backup-noc-app.sh
    
    # Add to crontab (daily at 2 AM)
    (crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-noc-app.sh >> $LOG_DIR/backup.log 2>&1") | crontab -
    
    log_info "Automated backups configured!"
}

display_info() {
    log_info "============================================"
    log_info "Deployment completed successfully!"
    log_info "============================================"
    log_info ""
    log_info "Application: http://localhost:3000"
    log_info "PM2 Status: pm2 status"
    log_info "PM2 Logs: pm2 logs $APP_NAME"
    log_info "Application Directory: $APP_DIR"
    log_info "Log Directory: $LOG_DIR"
    log_info "Backup Directory: $BACKUP_DIR"
    log_info ""
    log_info "Next steps:"
    log_info "1. Edit $APP_DIR/.env.local with your production values"
    log_info "2. Restart application: pm2 restart $APP_NAME"
    log_info "3. Configure Azure AD redirect URI"
    log_info "4. Test the application"
    log_info ""
    log_info "Useful commands:"
    log_info "- pm2 restart $APP_NAME   # Restart app"
    log_info "- pm2 logs $APP_NAME       # View logs"
    log_info "- pm2 monit                # Monitor resources"
    log_info "- systemctl status nginx    # Check Nginx"
    log_info "- systemctl status mongod   # Check MongoDB"
    log_info ""
}

# Main execution
main() {
    log_info "Starting NOC Email Report Generator deployment..."
    
    check_root
    
    log_info "Select deployment option:"
    echo "1. Full installation (dependencies + MongoDB + application)"
    echo "2. Update application only"
    echo "3. Install dependencies only"
    read -p "Enter option (1-3): " OPTION
    
    case $OPTION in
        1)
            install_dependencies
            install_mongodb
            setup_directories
            clone_repository
            install_app_dependencies
            setup_environment
            build_application
            setup_pm2
            configure_nginx
            log_info "Do you want to setup SSL? (y/n)"
            read SETUP_SSL
            if [ "$SETUP_SSL" = "y" ]; then
                setup_ssl
            fi
            configure_firewall
            setup_cron_backup
            ;;
        2)
            clone_repository
            install_app_dependencies
            build_application
            log_info "Restarting application..."
            sudo -u $SUDO_USER pm2 restart $APP_NAME
            ;;
        3)
            install_dependencies
            install_mongodb
            ;;
        *)
            log_error "Invalid option"
            exit 1
            ;;
    esac
    
    display_info
    
    log_info "Deployment script completed!"
}

# Run main function
main "$@"

