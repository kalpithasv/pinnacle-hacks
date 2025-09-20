# AgriTech Innovation Platform - Setup Guide

## 🚀 Complete Setup Instructions

### Prerequisites
- Node.js 18+
- pnpm 8+
- PostgreSQL 15+ (or Docker)
- Redis 7+ (optional, for background jobs)

### 1. Database Setup

#### Option A: Using Docker (Recommended)
```bash
# Start PostgreSQL with Docker
docker run --name agritech-postgres \
  -e POSTGRES_DB=agritech_innovation \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15

# Start Redis (optional)
docker run --name agritech-redis \
  -p 6379:6379 \
  -d redis:7-alpine
```

#### Option B: Local Installation
1. Install PostgreSQL 15+
2. Create database: `createdb agritech_innovation`
3. Install Redis (optional)

### 2. Environment Configuration

```bash
# Copy environment template
cp env.example .env

# Edit .env with your configuration
```

Required environment variables:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/agritech_innovation
GITHUB_TOKEN=your_github_personal_access_token
TWITTER_BEARER_TOKEN=your_twitter_bearer_token
GEMINI_API_KEY=your_gemini_api_key
ADK_API_URL=http://localhost:8000
ADK_API_KEY=your_adk_api_key
JWT_SECRET=your_jwt_secret_key
```

### 3. Install Dependencies

```bash
# Install all dependencies
pnpm install

# Generate Prisma client
cd backend && pnpm db:generate

# Run database migrations
pnpm db:migrate

# Seed the database
pnpm db:seed
```

### 4. Start Development Servers

```bash
# Start frontend (Terminal 1)
cd frontend && pnpm dev

# Start backend (Terminal 2)
cd backend && pnpm dev

# Start services (Terminal 3, optional)
cd services && pnpm dev
```

### 5. Access the Platform

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/docs

## 🎯 Key Features Implemented

### ✅ Authentication System
- User registration and login
- JWT-based authentication
- Role-based access (founder, investor, admin)
- Password hashing with bcrypt

### ✅ AgriTech Startup Management
- Comprehensive startup submission form
- Land details and ownership information
- Business model and funding requirements
- Technical integration (GitHub, Twitter, website)

### ✅ AI-Powered GI Analysis
- Google ADK integration for Geographical Indication analysis
- Automated analysis of land location and business model
- GI product identification and market potential scoring
- Certification recommendations

### ✅ Advanced Scoring System

#### Technical Score (Weighted)
- **Code Activity** (30%): Commit frequency and development activity
- **Community Engagement** (25%): Stars, forks, watchers
- **Project Maintenance** (25%): PR quality and issue resolution
- **Code Quality** (20%): Repository metrics and language support

#### Social Score (Weighted)
- **Reach** (40%): Follower count and verification status
- **Engagement** (35%): Likes, retweets, replies per tweet
- **Activity** (25%): Tweet frequency and consistency

#### GI Score
- Market potential analysis
- Uniqueness scoring
- Geographical region analysis
- GI product identification

### ✅ Investor Portal
- Investor profiles with preferences
- Investment range and stage preferences
- Portfolio tracking
- Rating system for startups

### ✅ UI Components
- Progress bars for score visualization
- Skeleton loading states
- Responsive grid layouts
- Modern card-based design
- Authentication forms

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Startups
- `GET /api/startups` - List startups with filtering
- `POST /api/startups` - Create new startup
- `GET /api/startups/:id` - Get startup details
- `PUT /api/startups/:id` - Update startup
- `POST /api/startups/:id/rate` - Rate startup

### Scoring
- `GET /api/scoring/startup/:id` - Get startup scores
- `POST /api/scoring/calculate` - Calculate scores
- `POST /api/scoring/batch` - Batch score calculation

### Investors
- `GET /api/investors` - List investors
- `POST /api/investors` - Create investor profile
- `GET /api/investors/:id` - Get investor details

### Matchmaking
- `GET /api/matchmaking` - List matches
- `POST /api/matchmaking/generate` - Generate matches
- `PUT /api/matchmaking/:id` - Update match status

## 🎨 Frontend Pages

1. **Home** (`/`) - Landing page with AgriTech focus
2. **Startups** (`/startups`) - Browse AgriTech startups
3. **Startup Detail** (`/startups/:id`) - Detailed startup view with scores
4. **Investors** (`/investors`) - Investor directory
5. **Dashboard** (`/dashboard`) - User dashboard
6. **Matchmaking** (`/matchmaking`) - AI-powered matching
7. **Submit Startup** (`/submit`) - Startup submission form
8. **Login** (`/login`) - User authentication
9. **Register** (`/register`) - User registration

## 🚀 Innovation Voucher Programme Integration

The platform is designed to support the Innovation Voucher Programme with:

- **Voucher A**: Up to ₹2 lakhs for converting ideas into working prototypes
- **Voucher B**: Up to ₹5 lakhs for commercialization support
- **Screening Committee**: State-level selection process
- **Knowledge Partners**: Integration with research institutions

## 🔍 Geographical Indication Features

- **Land Analysis**: AI analysis of land location and type
- **GI Product Identification**: Automatic identification of regional products
- **Market Potential**: Scoring based on GI certification potential
- **Certification Support**: Recommendations for GI certification process

## 📊 Database Schema

### Core Models
- `AgriTechStartup` - Main startup entity with land details
- `User` - Authentication and user management
- `Investor` - Investor profiles and preferences
- `GIAnalysis` - Geographical Indication analysis results
- `TechScore` - Technical scoring breakdown
- `SocialScore` - Social media scoring breakdown
- `Rating` - Startup rating system
- `Match` - Investor-startup matching

## 🛠 Development Commands

```bash
# Install dependencies
pnpm install

# Start development
pnpm dev

# Build for production
pnpm build

# Database operations
cd backend
pnpm db:migrate    # Run migrations
pnpm db:generate   # Generate Prisma client
pnpm db:seed       # Seed database

# Clean up
pnpm clean
```

## 🎯 Next Steps

1. **Set up PostgreSQL database**
2. **Configure environment variables**
3. **Run database migrations**
4. **Start development servers**
5. **Test the platform features**

The platform is now ready for AgriTech innovation discovery and investment! 🌱

