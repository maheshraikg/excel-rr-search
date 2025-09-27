# 🚀 Hostinger VPS Deployment Guide for Excel RR Search App

Your Excel RR Search application is ready for deployment on Hostinger VPS! This guide provides complete step-by-step instructions for setting up your app on a VPS server.

## 🎯 What You'll Get

✅ **Full control** over your server environment  
✅ **50MB upload limit** for large Excel files  
✅ **Better performance** than serverless hosting  
✅ **Custom domain** with SSL certificates  
✅ **PostgreSQL database** with full access  
✅ **PWA installation** and **AdSense monetization** preserved  

## 📋 Prerequisites

1. **Hostinger VPS account** - KVM2 plan recommended ($6.99/month)
2. **Domain name** - optional but recommended  
3. **Neon database** - free PostgreSQL hosting (or install PostgreSQL on VPS)

## 🛠️ Step 1: Get Your VPS Ready

### Order Hostinger VPS
1. Go to [Hostinger VPS Hosting](https://www.hostinger.com/vps-hosting)
2. Choose **KVM2** plan (2 vCPU, 8GB RAM, 100GB storage) - perfect for your app
3. Select **Ubuntu 24.04 with Node.js and OpenLiteSpeed** template
4. Complete your order and wait for setup email

### Access Your VPS
```bash
# Connect via SSH (use details from Hostinger email)
ssh root@your_vps_ip_address
```

## 🗄️ Step 2: Database Setup (Choose One)

### Option A: Use Neon (Recommended - Easy & Free)
1. Go to [neon.tech](https://neon.tech) and create free account
2. Create new project, copy connection string:
   ```
   postgresql://username:password@ep-xxxxx.us-east-1.aws.neon.tech/database?sslmode=require
   ```
3. **Note**: Your app is already configured for Neon hosting - no additional changes needed!

### Option B: Install PostgreSQL on VPS (Advanced Users)
**Note**: This requires changing your app's database driver from Neon to standard PostgreSQL.
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
CREATE DATABASE excel_search_db;
CREATE USER excel_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE excel_search_db TO excel_user;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
\q

# If using local PostgreSQL, you'll need to modify server/db.ts:
# Replace @neondatabase/serverless with pg package
# Replace drizzle-orm/neon-serverless with drizzle-orm/node-postgres
# This is advanced - Neon option is much easier!
```

## 📁 Step 3: Deploy Your Application

### Upload Your Code
```bash
# Clone from GitHub (recommended)
cd /var/www
git clone https://github.com/yourusername/excel-rr-search-app.git
cd excel-rr-search-app

# Or upload files via SFTP to /var/www/excel-rr-search-app/
```

### Install Dependencies
```bash
# Install Node.js dependencies
npm install

# Install PM2 for process management
npm install -g pm2
```

### Configure Environment Variables
```bash
# Create environment file
nano .env

# Add your database connection
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"
PGHOST="your_db_host"
PGPORT="5432"
PGDATABASE="your_database_name"
PGUSER="your_username"
PGPASSWORD="your_password"
NODE_ENV="production"
PORT="3000"
```

### Set Up Database Schema
```bash
# Push database schema
npm run db:push
```

### Build and Start Application
```bash
# Build the application
npm run build

# Start with PM2 (use production build)
pm2 start dist/index.js --name "excel-search-app"

# Alternative: use npm start
# pm2 start npm --name "excel-search-app" -- start
pm2 startup
pm2 save
```

## 🌐 Step 4: Configure Web Server (Nginx)

### Install and Configure Nginx
```bash
# Install Nginx
sudo apt install nginx -y

# Create site configuration
sudo nano /etc/nginx/sites-available/excel-search-app

# Add this configuration:
server {
    listen 80;
    server_name your_domain.com www.your_domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Handle static files
    location /assets/ {
        alias /var/www/excel-rr-search-app/dist/public/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Handle PWA files
    location ~ ^/(manifest\.json|sw\.js|icon.*\.png)$ {
        root /var/www/excel-rr-search-app/dist/public;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Enable the site
sudo ln -s /etc/nginx/sites-available/excel-search-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🔒 Step 5: SSL Certificate (Free with Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your_domain.com -d www.your_domain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

## 🔧 Step 6: Domain Configuration

### Point Domain to VPS
1. In your domain registrar (Hostinger, Cloudflare, etc.)
2. Add A record: `@` → `your_vps_ip_address`
3. Add A record: `www` → `your_vps_ip_address`
4. Wait for DNS propagation (5-60 minutes)

## 🔄 Step 7: Application Management

### Monitor Your App
```bash
# Check app status
pm2 status

# View logs
pm2 logs excel-search-app

# Restart app
pm2 restart excel-search-app

# Check Nginx status
sudo systemctl status nginx
```

### Update Your App
```bash
cd /var/www/excel-rr-search-app
git pull origin main
npm install
npm run build
pm2 restart excel-search-app
```

## 🛡️ Security Hardening (Recommended)

### Firewall Setup
```bash
# Enable UFW firewall
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
```

### Automatic Updates
```bash
# Enable automatic security updates
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure unattended-upgrades
```

## ⚡ Performance Optimization

### Enable Gzip Compression
Add to Nginx config in `/etc/nginx/sites-available/excel-search-app`:
```nginx
# Add inside server block
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

### Database Connection Pooling
Your app already uses connection pooling with Neon/PostgreSQL for optimal performance.

## 🎯 Features Preserved

✅ **Excel Upload & Search** - Now with 50MB file limit  
✅ **PWA Installation** - Works with your custom domain  
✅ **Google Analytics** - Tracking ID: G-PT85NLYXZB  
✅ **AdSense Monetization** - All ad units functional  
✅ **Mobile Responsive** - Perfect on all devices  

## 🔍 Troubleshooting

**App Won't Start:**
```bash
pm2 logs excel-search-app
```

**Database Connection Issues:**
- Check DATABASE_URL in .env file
- Ensure database server is running
- Verify firewall allows connections

**Nginx Issues:**
```bash
sudo nginx -t
sudo systemctl status nginx
```

**SSL Certificate Problems:**
```bash
sudo certbot renew --dry-run
```

## 💰 Cost Breakdown

- **Hostinger VPS KVM2:** $6.99/month
- **Domain (optional):** $10-15/year  
- **Database:** FREE (Neon) or included in VPS
- **SSL Certificate:** FREE (Let's Encrypt)

**Total: ~$7/month** (much cheaper than Replit!)

## 🚀 Next Steps

1. **Test everything** - Upload files, search, check PWA installation
2. **Set up monitoring** - Consider adding Uptime Robot for monitoring
3. **Backup strategy** - Regular database backups
4. **Scale up** - Upgrade VPS plan if traffic grows

Your Excel RR Search app is now running on professional VPS hosting with full control and better performance! 🎉