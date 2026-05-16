#!/bin/bash

# Checkmate.Uno Database Setup Script
# This script helps set up Supabase and run migrations

set -e

echo "================================"
echo "Checkmate.Uno Database Setup"
echo "================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo ""
    echo "Please create .env file first with:"
    echo "  DATABASE_URL=postgresql://postgres:password@host:6543/postgres?sslmode=require"
    echo "  JWT_SECRET=your-secret-key-at-least-32-chars"
    echo ""
    exit 1
fi

echo "✅ .env file found"
echo ""

# Check if DATABASE_URL is set
if ! grep -q "DATABASE_URL=" .env; then
    echo "❌ DATABASE_URL not set in .env"
    exit 1
fi

echo "Step 1: Installing dependencies..."
npm install --silent
echo "✅ Dependencies installed"
echo ""

echo "Step 2: Generating Prisma Client..."
npx prisma generate
echo "✅ Prisma client generated"
echo ""

echo "Step 3: Running migrations..."
npx prisma migrate dev --name init
echo "✅ Migrations completed"
echo ""

echo "Step 4: Verifying database connection..."
npx prisma db execute --stdin < /dev/null && echo "✅ Database connection verified" || {
    echo "❌ Database connection failed"
    exit 1
}
echo ""

echo "Step 5: Opening Prisma Studio..."
echo "   Prisma Studio will open at http://localhost:5555"
echo "   You can view/edit database records there"
echo ""
read -p "Open Prisma Studio? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx prisma studio
fi

echo ""
echo "================================"
echo "✅ Database Setup Complete!"
echo "================================"
echo ""
echo "Next steps:"
echo "  1. Run: npm run start:dev"
echo "  2. Test API at: http://localhost:3000/api"
echo ""
