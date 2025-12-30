#!/bin/bash

# ============================================================================
# LOCAL DEVELOPMENT SETUP SCRIPT
# Autocrat Engineers - Scrap Management System
# 
# This script automates the setup of your local development environment
# 
# Usage: chmod +x scripts/setup-local.sh && ./scripts/setup-local.sh
# ============================================================================

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_header() {
    echo ""
    echo "=================================="
    echo "$1"
    echo "=================================="
}

# ============================================================================
# STEP 1: Check Prerequisites
# ============================================================================

print_header "Step 1: Checking Prerequisites"

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version must be 18 or higher (current: $NODE_VERSION)"
    exit 1
fi
print_success "Node.js $(node -v) detected"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi
print_success "npm $(npm -v) detected"

# ============================================================================
# STEP 2: Install Dependencies
# ============================================================================

print_header "Step 2: Installing Dependencies"

if [ -f "package-lock.json" ]; then
    npm ci
else
    npm install
fi
print_success "Dependencies installed"

# ============================================================================
# STEP 3: Environment Configuration
# ============================================================================

print_header "Step 3: Environment Configuration"

if [ ! -f ".env.local" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        print_success "Created .env.local from .env.example"
        
        print_warning "IMPORTANT: You need to configure .env.local with your Supabase credentials"
        echo ""
        echo "📝 Next steps:"
        echo "1. Go to https://app.supabase.com/project/YOUR_PROJECT/settings/api"
        echo "2. Copy 'Project URL' to VITE_SUPABASE_URL"
        echo "3. Copy 'anon public' key to VITE_SUPABASE_ANON_KEY"
        echo "4. Save the file and run: npm run dev"
        echo ""
        
        # Ask if user wants to open the file now
        read -p "Would you like to edit .env.local now? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            ${EDITOR:-nano} .env.local
        fi
    else
        print_error ".env.example not found"
        exit 1
    fi
else
    print_success ".env.local already exists"
fi

# Validate environment variables
if grep -q "your_supabase_project_url_here" .env.local 2>/dev/null; then
    print_warning "Environment variables not configured yet"
    echo "Please update .env.local with your Supabase credentials"
else
    print_success "Environment variables configured"
fi

# ============================================================================
# STEP 4: Git Configuration
# ============================================================================

print_header "Step 4: Git Configuration"

# Ensure .env files are ignored
if [ -f ".gitignore" ]; then
    if ! grep -q "^.env.local$" .gitignore; then
        echo ".env.local" >> .gitignore
        print_success "Added .env.local to .gitignore"
    else
        print_success ".gitignore already configured"
    fi
fi

# ============================================================================
# STEP 5: Database Setup (Optional - if using Supabase CLI)
# ============================================================================

print_header "Step 5: Database Setup (Optional)"

if command -v supabase &> /dev/null; then
    print_success "Supabase CLI detected"
    
    read -p "Would you like to run database migrations? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Running migrations..."
        supabase db push
        print_success "Migrations completed"
        
        read -p "Would you like to seed the database with test data? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            supabase db seed
            print_success "Database seeded"
        fi
    fi
else
    print_warning "Supabase CLI not installed"
    echo "You can install it with: npm install -g supabase"
    echo "Or run migrations manually from Supabase SQL Editor"
fi

# ============================================================================
# STEP 6: Verification
# ============================================================================

print_header "Step 6: Setup Verification"

# Check if all critical files exist
CRITICAL_FILES=(
    "package.json"
    ".env.local"
    "src/config/supabase.ts"
    "src/services/api/auth.service.ts"
    "supabase/migrations/00001_initial_schema.sql"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_success "$file exists"
    else
        print_error "$file is missing"
        exit 1
    fi
done

# ============================================================================
# COMPLETION
# ============================================================================

print_header "Setup Complete! 🎉"

echo ""
echo "Next steps:"
echo "1. Ensure .env.local has your Supabase credentials"
echo "2. Run: npm run dev"
echo "3. Open: http://localhost:5173"
echo "4. Check browser console for Supabase connection status"
echo ""
echo "📖 Documentation:"
echo "- Architecture: docs/COMPLETE_BACKEND_ARCHITECTURE.md"
echo "- API Guide: docs/API.md"
echo "- Security: docs/SECURITY.md"
echo ""
echo "Need help? Check the documentation or contact the team."
echo ""

print_success "Happy coding!"
