export interface Project {
  id: string
  name: string
  description: string
  githubUrl?: string
  twitterUrl?: string
  website?: string
  logo?: string
  location?: string
  industry: string
  stage: 'idea' | 'mvp' | 'early' | 'growth' | 'scale'
  fundingGoal?: number
  currentFunding?: number
  teamSize: number
  foundedYear: number
  techScore: number
  socialScore: number
  overallScore: number
  isDiscovered: boolean // true if discovered by geo-social agent
  createdAt: string
  updatedAt: string
  tags: string[]
  metrics: {
    githubStars?: number
    githubForks?: number
    githubCommits?: number
    githubPrs?: number
    githubIssues?: number
    twitterFollowers?: number
    twitterTweets?: number
    twitterEngagement?: number
  }
}

export interface Investor {
  id: string
  name: string
  email: string
  company?: string
  title?: string
  bio?: string
  avatar?: string
  location?: string
  investmentRange: {
    min: number
    max: number
  }
  preferredStages: string[]
  preferredIndustries: string[]
  portfolio: string[] // project IDs
  preferences: {
    techScoreMin: number
    socialScoreMin: number
    teamSizeMin: number
    foundedYearMin: number
  }
  createdAt: string
  updatedAt: string
}

export interface Match {
  id: string
  investorId: string
  projectId: string
  score: number
  reasons: string[]
  status: 'pending' | 'accepted' | 'rejected' | 'contacted'
  createdAt: string
  updatedAt: string
}

export interface TechScore {
  projectId: string
  score: number
  breakdown: {
    commitFrequency: number
    prQuality: number
    issueResolution: number
    codeQuality: number
    communityEngagement: number
  }
  lastUpdated: string
}

export interface SocialScore {
  projectId: string
  score: number
  breakdown: {
    tweetFrequency: number
    engagement: number
    followerGrowth: number
    contentQuality: number
    brandAwareness: number
  }
  lastUpdated: string
}

export interface GeoSocialDiscovery {
  id: string
  location: string
  businessName: string
  socialMediaUrl: string
  description: string
  industry: string
  confidence: number
  discoveredAt: string
  status: 'pending' | 'verified' | 'rejected'
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

