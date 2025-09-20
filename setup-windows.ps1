# AgriTech Innovation Platform - Windows Setup Script

Write-Host "🚀 Setting up AgriTech Innovation Platform..." -ForegroundColor Green

# Check if Node.js is installed
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed. Please install Node.js v18+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if pnpm is installed
if (!(Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "📦 Installing pnpm..." -ForegroundColor Yellow
    npm install -g pnpm
}

# Check if PostgreSQL is installed
if (!(Get-Command psql -ErrorAction SilentlyContinue)) {
    Write-Host "❌ PostgreSQL is not installed. Please install PostgreSQL from https://www.postgresql.org/download/windows/" -ForegroundColor Red
    Write-Host "Make sure to add PostgreSQL to your PATH during installation." -ForegroundColor Yellow
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
pnpm install:all

# Check if .env exists
if (!(Test-Path ".env")) {
    Write-Host "📝 Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item "env.example" ".env"
    Write-Host "⚠️  Please edit .env file with your API keys and database credentials" -ForegroundColor Yellow
}

# Check PostgreSQL service
Write-Host "🗄️  Checking PostgreSQL service..." -ForegroundColor Yellow
try {
    $pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
    if ($pgService -and $pgService.Status -ne "Running") {
        Write-Host "🔄 Starting PostgreSQL service..." -ForegroundColor Yellow
        Start-Service $pgService.Name
    }
} catch {
    Write-Host "⚠️  Could not check PostgreSQL service. Please ensure PostgreSQL is running." -ForegroundColor Yellow
}

# Create database
Write-Host "🗄️  Setting up database..." -ForegroundColor Yellow
try {
    # Check if database exists
    $dbExists = psql -U postgres -lqt | Select-String "agritech_innovation"
    if (!$dbExists) {
        Write-Host "📊 Creating database..." -ForegroundColor Yellow
        createdb -U postgres agritech_innovation
    }
    
    # Run migrations and seed
    Write-Host "🔄 Running database migrations..." -ForegroundColor Yellow
    cd backend
    pnpm db:migrate
    pnpm db:seed
    cd ..
    
    Write-Host "✅ Database setup complete!" -ForegroundColor Green
} catch {
    Write-Host "❌ Database setup failed. Please check your PostgreSQL configuration." -ForegroundColor Red
    Write-Host "Make sure PostgreSQL is running and accessible with user 'postgres'." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Setup complete! Next steps:" -ForegroundColor Green
Write-Host "1. Edit .env file with your API keys" -ForegroundColor White
Write-Host "2. Run 'pnpm dev' to start development servers" -ForegroundColor White
Write-Host "3. Open http://localhost:5173 in your browser" -ForegroundColor White
Write-Host ""
Write-Host "📚 For more information, see setup-dev.md" -ForegroundColor Cyan
