#!/bin/bash

# Excel RR Search App - Automatic Setup Script for Hostinger VPS
# This script will install and configure everything automatically

echo "========================================="
echo "Excel RR Search App - Auto Setup"
echo "========================================="
echo ""

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "Please run this script as root (use: sudo bash setup.sh)"
   exit 1
fi

# Update system packages
echo "Step 1: Updating system packages..."
apt update -y
apt upgrade -y

# Install Node.js 20.x
echo "Step 2: Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2 (process manager)
echo "Step 3: Installing PM2..."
npm install -g pm2

# Install Nginx
echo "Step 4: Installing Nginx..."
apt install -y nginx

# Create app directory
APP_DIR="/var/www/excel-rr-search"
echo "Step 5: Creating application directory at $APP_DIR..."
mkdir -p $APP_DIR

# Get current directory (where the script is run from)
CURRENT_DIR=$(pwd)

# Copy all files to app directory
echo "Step 6: Copying application files..."
cp -r $CURRENT_DIR/* $APP_DIR/
cd $APP_DIR

# Install dependencies
echo "Step 7: Installing application dependencies..."
npm install --production=false

# Build the application
echo "Step 8: Building the application..."
npm run build

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Step 9: Creating .env file..."
    cat > .env << 'EOF'
NODE_ENV=production
PORT=5000
DATABASE_URL=file:./data/app.db
EOF
fi

# Create data directory for Excel files
mkdir -p $APP_DIR/user_data
chmod 755 $APP_DIR/user_data

# Set proper permissions
echo "Step 10: Setting permissions..."
chown -R www-data:www-data $APP_DIR
chmod -R 755 $APP_DIR

# Configure Nginx
echo "Step 11: Configuring Nginx..."
cat > /etc/nginx/sites-available/excel-rr-search << 'EOF'
server {
    listen 80;
    server_name _;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Increase client max body size for file uploads
    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Increase timeouts for large file processing
        proxy_connect_timeout 600;
        proxy_send_timeout 600;
        proxy_read_timeout 600;
        send_timeout 600;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/excel-rr-search /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
echo "Step 12: Testing Nginx configuration..."
nginx -t

# Restart Nginx
echo "Step 13: Restarting Nginx..."
systemctl restart nginx
systemctl enable nginx

# Start the app with PM2
echo "Step 14: Starting application with PM2..."
cd $APP_DIR
pm2 delete excel-rr-search 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root

# Show firewall status
echo ""
echo "Step 15: Checking firewall..."
if command -v ufw &> /dev/null; then
    ufw allow 80
    ufw allow 443
    ufw --force enable
    echo "Firewall configured to allow HTTP and HTTPS"
fi

echo ""
echo "========================================="
echo "Setup Complete!"
echo "========================================="
echo ""
echo "Your Excel RR Search app is now running!"
echo ""
echo "Access it at: http://$(curl -s ifconfig.me)"
echo ""
echo "Useful commands:"
echo "  - Check app status: pm2 status"
echo "  - View app logs: pm2 logs excel-rr-search"
echo "  - Restart app: pm2 restart excel-rr-search"
echo "  - Stop app: pm2 stop excel-rr-search"
echo ""
echo "Your Excel files are stored in: $APP_DIR/user_data"
echo ""
