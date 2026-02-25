#!/bin/bash

# TaxFlowAI Backend Setup Script
# This script automates the complete backend setup process

set -e  # Exit on error

echo "======================================"
echo "  TaxFlowAI Backend Setup"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}ℹ${NC}  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo -e "${GREEN}✓${NC}  .env file created"
    echo -e "${YELLOW}⚠${NC}  IMPORTANT: Edit .env with your Supabase credentials before continuing!"
    echo ""
    echo "   Please update the following in .env:"
    echo "   - DATABASE_URL (replace YOUR-PROJECT-REF and [YOUR-PASSWORD])"
    echo "   - DIRECT_URL (replace YOUR-PROJECT-REF and [YOUR-PASSWORD])"
    echo "   - SUPABASE_URL (your Supabase project URL)"
    echo "   - SUPABASE_SERVICE_KEY (service role key from Supabase Dashboard)"
    echo "   - SMTP_USER and SMTP_PASS (for email functionality)"
    echo "   - JWT_SECRET (generate a secure random string)"
    echo ""
    read -p "Press Enter after updating .env to continue, or Ctrl+C to exit..."
else
    echo -e "${GREEN}✓${NC}  .env file exists"
fi

echo ""
echo "Installing npm dependencies..."
npm install

echo ""
echo "Generating Prisma Client..."
npx prisma generate

echo ""
echo "Pushing database schema to Supabase..."
echo -e "${YELLOW}ℹ${NC}  This will create/update tables in your Supabase database"
npx prisma db push

echo ""
echo -e "${GREEN}======================================"
echo "  ✓ Setup Complete!"
echo "======================================${NC}"
echo ""
echo "Next steps:"
echo "  1. Verify your .env configuration"
echo ""
echo "  2. ${YELLOW}Set up Supabase Storage:${NC}"
echo "     - Go to Supabase Dashboard → Storage"
echo "     - Create new bucket: 'tax-documents'"
echo "     - Set to PUBLIC or configure RLS policies"
echo "     - Add SUPABASE_URL and SUPABASE_SERVICE_KEY to .env"
echo ""
echo "  3. Start the development server:"
echo "     ${GREEN}npm run dev${NC}"
echo ""
echo "  4. Test the API:"
echo "     ${GREEN}npm run test:api${NC}"
echo ""
echo "  5. Open Prisma Studio (optional):"
echo "     ${GREEN}npm run db:studio${NC}"
echo ""
echo "For detailed instructions, see QUICKSTART.md"
echo ""
