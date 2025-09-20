# AgriTech Innovation Platform - Development Setup

## Prerequisites

1. **Node.js** (v18 or higher)
2. **pnpm** (v8 or higher)
3. **PostgreSQL** (v15 or higher)
4. **Redis** (optional, for job queues)

## Quick Start

### 1. Install Dependencies
```bash
pnpm install:all
```

### 2. Database Setup
```bash
# Start PostgreSQL service (Windows)
net start postgresql-x64-15

# Create database
createdb agritech_innovation

# Run migrations
cd backend
pnpm db:migrate
pnpm db:seed
```

### 3. Environment Configuration
```bash
# Copy environment file
cp env.example .env

# Edit .env with your API keys and database credentials
```

### 4. Start Development Servers
```bash
# Start all services
pnpm dev

# Or start individually:
# Backend: pnpm --filter backend dev
# Frontend: pnpm --filter frontend dev
```

## API Keys Required

1. **GitHub Personal Access Token**
   - Go to GitHub Settings > Developer settings > Personal access tokens
   - Generate token with `repo` and `user` scopes

2. **Twitter Bearer Token**
   - Apply for Twitter API access
   - Get Bearer Token from Twitter Developer Portal

3. **Google Gemini API Key**
   - Go to Google AI Studio
   - Create API key for Gemini

4. **Google ADK API**
   - Set up local ADK service or use cloud version
   - Configure API key and URL

## Database Schema

The platform uses PostgreSQL with the following main entities:
- **AgriTechStartup**: Core startup information with land details
- **User**: Authentication for founders and investors
- **Investor**: Investor profiles and preferences
- **Rating**: Rating system for startups
- **Match**: Investor-startup matching system
- **GIAnalysis**: Geographic Indication analysis results

## Development URLs

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- API Documentation: http://localhost:3001/api/docs

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL status
pg_ctl status

# Restart PostgreSQL
pg_ctl restart
```

### Port Conflicts
- Backend: Change PORT in .env
- Frontend: Change port in vite.config.ts
- Database: Change port in DATABASE_URL

### API Key Issues
- Verify all API keys are correctly set in .env
- Check API key permissions and quotas
- Test API endpoints individually
