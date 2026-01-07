#!/bin/bash

# VPS Initial Setup Script for Pi-Gigs
# Usage: ./scripts/setup-vps.sh
# Run as: sudo ./scripts/setup-vps.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🖥️  Pi-Gigs VPS Setup Script${NC}"
echo -e "${GREEN}================================${NC}\n"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
   echo -e "${RED}❌ Please run as root (use sudo)${NC}"
   exit 1
fi

# Update system
echo -e "${GREEN}📦 Updating system packages...${NC}"
apt update
apt upgrade -y

# Install basic tools
echo -e "${GREEN}🔧 Installing basic tools...${NC}"
apt install -y curl wget git build-essential

# Install Node.js 20.x
echo -e "${GREEN}📦 Installing Node.js 20.x...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install Yarn
echo -e "${GREEN}📦 Installing Yarn...${NC}"
npm install -g yarn

# Install PostgreSQL
echo -e "${GREEN}🗄️  Installing PostgreSQL...${NC}"
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql

# Install PM2
echo -e "${GREEN}📦 Installing PM2...${NC}"
npm install -g pm2

# Install Nginx
echo -e "${GREEN}🌐 Installing Nginx...${NC}"
apt install -y nginx
systemctl start nginx
systemctl enable nginx

# Install Certbot (for SSL)
echo -e "${GREEN}🔒 Installing Certbot...${NC}"
apt install -y certbot python3-certbot-nginx

# Configure Firewall
echo -e "${GREEN}🔥 Configuring firewall...${NC}"
if command -v ufw &> /dev/null; then
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable
fi

# Create project directory
echo -e "${GREEN}📂 Creating project directory...${NC}"
mkdir -p /var/www/pi-gigs
chown -R $SUDO_USER:$SUDO_USER /var/www/pi-gigs

# Create logs directory
mkdir -p /var/www/pi-gigs/logs
chown -R $SUDO_USER:$SUDO_USER /var/www/pi-gigs/logs

echo -e "\n${GREEN}✅ VPS setup completed!${NC}\n"
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Clone your repository to /var/www/pi-gigs"
echo -e "2. Create .env file with your configuration"
echo -e "3. Setup PostgreSQL database and user"
echo -e "4. Run: yarn install && npx prisma generate && yarn build"
echo -e "5. Start with PM2: pm2 start npm --name pi-gigs -- start"
echo -e "6. Configure Nginx (see VPS_DEPLOYMENT_GUIDE.md)"
