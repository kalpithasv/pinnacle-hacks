# AgriTech Innovation Platform

A comprehensive platform for discovering, analyzing, and connecting AgriTech startups with investors using AI-powered insights and Geographical Indication analysis.

## 🌟 Features

- **Startup Submission**: Comprehensive form for AgriTech startups with land details
- **Authentication System**: Secure user and investor authentication
- **Geographical Indication Analysis**: Integration with Google ADK for GI product analysis
- **Scoring System**: Advanced scoring for GitHub, Twitter, and GI metrics
- **Investor Portal**: Rating system and matching for investors
- **Progress Tracking**: Real-time progress bars and UI components
- **Database Schema**: Complete PostgreSQL schema for AgriTech data

## 🛠 Tech Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **APIs**: GitHub, Twitter, Google Gemini
- **Services**: Microservices architecture with Redis queues
- **Package Manager**: pnpm

## 🏗 Project Structure

```
├── frontend/                    # React + Vite frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/             # Page components
│   │   ├── lib/               # Utilities and configurations
│   │   └── hooks/             # Custom React hooks
│   └── package.json
├── backend/                    # Express.js API server
│   ├── src/
│   │   ├── routes/            # API route handlers
│   │   └── index.ts           # Main server file
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.ts            # Database seeding
│   └── package.json
├── services/                   # Microservices
│   ├── scoring-service/       # Tech & social scoring
│   ├── discovery-service/     # Geo-social business discovery
│   ├── matchmaking-service/   # AI-powered matchmaking
│   └── package.json
├── shared/                     # Shared types and utilities
│   ├── types/                 # TypeScript type definitions
│   └── utils/                 # Shared utility functions
└── docker-compose.yml         # Docker orchestration
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm 8+
- PostgreSQL 15+
- Redis 7+

### 1. Clone and Install

```bash
git clone <repository-url>
cd pinnacle-hacks
pnpm install:all
```

### 2. Environment Setup

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/pinnacle_hacks

# GitHub API
GITHUB_TOKEN=your_github_personal_access_token

# Twitter API
TWITTER_BEARER_TOKEN=your_twitter_bearer_token

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend Configuration
VITE_API_URL=http://localhost:3001/api
```

### 3. Database Setup

```bash
# Start PostgreSQL and Redis
# Using Docker (recommended):
docker-compose up postgres redis -d

# Or install locally and start services

# Run database migrations
cd backend
pnpm db:migrate

# Seed the database
pnpm db:seed
```

### 4. Start Development Servers

```bash
# Start all services
pnpm dev

# Or start individually:
pnpm --filter frontend dev      # http://localhost:5173
pnpm --filter backend dev       # http://localhost:3001
pnpm --filter services dev      # Services on ports 3002-3004
```

## 🐳 Docker Setup (Alternative)

```bash
# Start all services with Docker
docker-compose up

# Or start specific services
docker-compose up postgres redis backend frontend
```

## 🔑 API Keys Setup

### GitHub API
1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Generate a new token with `repo` and `read:user` scopes
3. Add to `.env` as `GITHUB_TOKEN`

### Twitter API
1. Apply for Twitter Developer account
2. Create a new app and get Bearer Token
3. Add to `.env` as `TWITTER_BEARER_TOKEN`

### Google Gemini API
1. Go to Google AI Studio
2. Create a new API key
3. Add to `.env` as `GEMINI_API_KEY`

## 📊 Services Overview

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 5173 | React application |
| Backend API | 3001 | Main API server |
| Scoring Service | 3002 | GitHub/Twitter scoring |
| Discovery Service | 3003 | Geo-social business discovery |
| Matchmaking Service | 3004 | AI-powered matching |
| PostgreSQL | 5432 | Database |
| Redis | 6379 | Job queues |

## 🧪 API Endpoints

### Projects
- `GET /api/projects` - List projects with filtering
- `GET /api/projects/:id` - Get project details
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project

### Investors
- `GET /api/investors` - List investors
- `GET /api/investors/:id` - Get investor details
- `POST /api/investors` - Create new investor

### Matchmaking
- `GET /api/matchmaking` - List matches
- `POST /api/matchmaking/generate` - Generate new matches
- `PUT /api/matchmaking/:id` - Update match status

### Scoring
- `GET /api/scoring/project/:id` - Get project scores
- `POST /api/scoring/calculate` - Calculate scores
- `POST /api/scoring/batch` - Batch score calculation

### Discovery
- `GET /api/discovery` - List discoveries
- `POST /api/discovery/discover` - Start discovery
- `PUT /api/discovery/:id/verify` - Verify discovery

## 🎯 Key Features Explained

### Tech Scoring Algorithm
- **Commit Frequency**: Recent commits per day (30-day window)
- **PR Quality**: Merge rate and code review metrics
- **Issue Resolution**: Closed vs open issues ratio
- **Code Quality**: Repository metrics (stars, forks, size)
- **Community Engagement**: Stars, forks, watchers

### Social Scoring Algorithm
- **Tweet Frequency**: Recent tweets per day (30-day window)
- **Engagement**: Likes, retweets, replies per tweet
- **Follower Growth**: Follower count and growth rate
- **Content Quality**: Engagement per tweet ratio
- **Brand Awareness**: Follower count and verification status

### AI Matchmaking
- Uses Google Gemini to analyze investor-project compatibility
- Considers industry alignment, stage preferences, team size
- Generates detailed match reasons and confidence scores
- Processes matches in background queues for scalability

### Geo-Social Discovery
- Scans location-based social media content
- Identifies business-related posts and profiles
- Applies AI filtering to detect startup characteristics
- Automatically creates project entries for verified discoveries

## 🚀 Production Deployment

### Environment Variables
Set production environment variables:
- `NODE_ENV=production`
- `DATABASE_URL=<production-db-url>`
- `REDIS_URL=<production-redis-url>`

### Build and Deploy
```bash
# Build all services
pnpm build

# Start production servers
pnpm start
```

### Docker Production
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

---

**Built with ❤️ for the startup ecosystem**
