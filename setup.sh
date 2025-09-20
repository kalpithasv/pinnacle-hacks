#!/bin/bash

# AgriTech Innovation Platform - Setup Script

echo "🚀 Setting up AgriTech Innovation Platform..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18+ from https://nodejs.org/"
    exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL from https://www.postgresql.org/download/"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install:all

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your API keys and database credentials"
fi

# Check PostgreSQL service
echo "🗄️  Checking PostgreSQL service..."
if command -v systemctl &> /dev/null; then
    if systemctl is-active --quiet postgresql; then
        echo "✅ PostgreSQL is running"
    else
        echo "🔄 Starting PostgreSQL service..."
        sudo systemctl start postgresql
    fi
elif command -v brew &> /dev/null; then
    if brew services list | grep postgresql | grep started; then
        echo "✅ PostgreSQL is running"
    else
        echo "🔄 Starting PostgreSQL service..."
        brew services start postgresql
    fi
fi

# Create database
echo "🗄️  Setting up database..."
if psql -U postgres -lqt | cut -d \| -f 1 | grep -qw agritech_innovation; then
    echo "✅ Database already exists"
else
    echo "📊 Creating database..."
    createdb -U postgres agritech_innovation
fi

# Run migrations and seed
echo "🔄 Running database migrations..."
cd backend
pnpm db:migrate
pnpm db:seed
cd ..

echo "✅ Database setup complete!"

echo ""
echo "🎉 Setup complete! Next steps:"
echo "1. Edit .env file with your API keys"
echo "2. Run 'pnpm dev' to start development servers"
echo "3. Open http://localhost:5173 in your browser"
echo ""
echo "📚 For more information, see setup-dev.md"
