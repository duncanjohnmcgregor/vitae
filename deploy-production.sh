#!/bin/bash

# Vitae Production Deployment Script
# This script ensures safe deployment to production with proper security settings

echo "========================================="
echo "Vitae Production Deployment"
echo "========================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "Checking prerequisites..."

if ! command_exists firebase; then
    echo -e "${RED}Error: Firebase CLI not found. Please install it first.${NC}"
    echo "Run: npm install -g firebase-tools"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "firebase.json" ]; then
    echo -e "${RED}Error: firebase.json not found. Are you in the project root?${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Prerequisites check passed${NC}"
echo ""

# Safety checks
echo "Performing safety checks..."

# Check if production rules exist
if [ ! -f "firestore.rules.production" ]; then
    echo -e "${RED}Error: firestore.rules.production not found!${NC}"
    echo "Production security rules are missing."
    exit 1
fi

# Check if using development rules
if grep -q "DEVELOPMENT ONLY - INSECURE" firestore.rules; then
    echo -e "${YELLOW}Warning: Current firestore.rules contains development rules.${NC}"
    echo "Switching to production rules..."
    cp firestore.rules firestore.rules.backup
    cp firestore.rules.production firestore.rules
    echo -e "${GREEN}✓ Production rules applied${NC}"
else
    echo -e "${GREEN}✓ Production rules already in place${NC}"
fi

echo ""

# Confirm deployment
echo -e "${YELLOW}This script will deploy to PRODUCTION.${NC}"
echo "The following will be deployed:"
echo "  - Firestore security rules (production)"
echo "  - Cloud Functions (with auth checks)"
echo "  - Hosting files"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Deployment cancelled."
    exit 0
fi

echo ""

# Check if admin secret is configured
echo "Checking admin secret configuration..."
if firebase functions:config:get admin.secret >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Admin secret is configured${NC}"
else
    echo -e "${YELLOW}Admin secret not configured.${NC}"
    echo "Would you like to set it now?"
    read -p "Enter admin secret (or press Enter to skip): " secret
    if [ ! -z "$secret" ]; then
        firebase functions:config:set admin.secret="$secret"
        echo -e "${GREEN}✓ Admin secret configured${NC}"
    else
        echo -e "${YELLOW}⚠ Skipping admin secret configuration${NC}"
        echo "Remember to set it before creating admin users!"
    fi
fi

echo ""

# Deploy
echo "Starting deployment..."
echo ""

# Deploy Firestore rules
echo "1. Deploying Firestore rules..."
if firebase deploy --only firestore:rules; then
    echo -e "${GREEN}✓ Firestore rules deployed${NC}"
else
    echo -e "${RED}✗ Failed to deploy Firestore rules${NC}"
    exit 1
fi

echo ""

# Deploy Functions
echo "2. Deploying Cloud Functions..."
if firebase deploy --only functions; then
    echo -e "${GREEN}✓ Cloud Functions deployed${NC}"
else
    echo -e "${RED}✗ Failed to deploy Cloud Functions${NC}"
    exit 1
fi

echo ""

# Deploy Hosting
echo "3. Deploying hosting..."
if firebase deploy --only hosting; then
    echo -e "${GREEN}✓ Hosting deployed${NC}"
else
    echo -e "${RED}✗ Failed to deploy hosting${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Create admin users using: node setup-admin-user.js"
echo "2. Test the admin panel at your production URL"
echo "3. Monitor function logs for any issues"
echo ""
echo "Security reminders:"
echo "- Only grant admin access to trusted users"
echo "- Use strong passwords for all admin accounts"
echo "- Regularly review access logs"
echo "- Keep the admin secret secure"
echo "" 