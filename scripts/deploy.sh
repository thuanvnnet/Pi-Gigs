#!/bin/bash

# Pi-Gigs Deployment Script
# Usage: ./scripts/deploy.sh

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/var/www/pi-gigs"
APP_NAME="pi-gigs"

echo -e "${GREEN}🚀 Starting deployment...${NC}"

# Check if running as correct user
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}❌ Please do not run as root. Use a regular user with sudo privileges.${NC}"
   exit 1
fi

# Navigate to project directory
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${YELLOW}⚠️  Project directory not found. Using current directory.${NC}"
    PROJECT_DIR=$(pwd)
fi

cd "$PROJECT_DIR"

echo -e "${GREEN}📂 Working directory: $PROJECT_DIR${NC}"

# Backup .env file
if [ -f .env ]; then
    echo -e "${YELLOW}📦 Backing up .env file...${NC}"
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
fi

# Pull latest code
echo -e "${GREEN}📥 Pulling latest code...${NC}"
git pull origin main || {
    echo -e "${YELLOW}⚠️  Git pull failed or not a git repository. Continuing...${NC}"
}

# Install dependencies
echo -e "${GREEN}📦 Installing dependencies...${NC}"
yarn install --frozen-lockfile || npm install

# Generate Prisma Client
echo -e "${GREEN}🔧 Generating Prisma Client...${NC}"
npx prisma generate || {
    echo -e "${RED}❌ Prisma generate failed!${NC}"
    exit 1
}

# Run migrations
echo -e "${GREEN}🗄️  Running database migrations...${NC}"
npx prisma migrate deploy || {
    echo -e "${YELLOW}⚠️  Migration failed. Check database connection.${NC}"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
}

# Build application
echo -e "${GREEN}🏗️  Building application...${NC}"
yarn build || {
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
}

# Restart PM2
if command -v pm2 &> /dev/null; then
    echo -e "${GREEN}🔄 Restarting PM2...${NC}"
    
    # Check if app is running
    if pm2 list | grep -q "$APP_NAME"; then
        echo -e "${GREEN}   Reloading $APP_NAME...${NC}"
        pm2 reload "$APP_NAME" || pm2 restart "$APP_NAME"
    else
        echo -e "${GREEN}   Starting $APP_NAME...${NC}"
        pm2 start npm --name "$APP_NAME" -- start
    fi
    
    # Save PM2 configuration
    pm2 save
    
    # Show status
    echo -e "${GREEN}📊 PM2 Status:${NC}"
    pm2 status
else
    echo -e "${YELLOW}⚠️  PM2 not found. Please restart application manually.${NC}"
fi

# Test application
echo -e "${GREEN}🧪 Testing application...${NC}"
sleep 2

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Application is running!${NC}"
else
    echo -e "${YELLOW}⚠️  Application might not be running. Check PM2 logs.${NC}"
fi

echo -e "${GREEN}✨ Deployment completed!${NC}"
echo -e "${GREEN}📝 Check logs with: pm2 logs $APP_NAME${NC}"
