import express from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import axios from 'axios'

const router: express.Router = express.Router()
const prisma = new PrismaClient()

// Validation schemas
const scoreStartupSchema = z.object({
  startupId: z.string(),
  forceUpdate: z.boolean().default(false)
})

// GET /api/scoring/startup/:id - Get scores for a startup
router.get('/startup/:id', async (req, res) => {
  try {
    const { id } = req.params

    const startup = await prisma.agriTechStartup.findUnique({
      where: { id },
      include: {
        techScoreData: true,
        socialScoreData: true,
        giAnalysisData: true,
        metrics: true
      }
    })

    if (!startup) {
      return res.status(404).json({
        success: false,
        error: 'Startup not found'
      })
    }

    res.json({
      success: true,
      data: {
        startupId: id,
        techScore: startup.techScoreData,
        socialScore: startup.socialScoreData,
        giScore: startup.giAnalysisData,
        metrics: startup.metrics,
        overallScore: startup.overallScore
      }
    })
  } catch (error) {
    console.error('Error fetching scores:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch scores'
    })
  }
})

// POST /api/scoring/calculate - Calculate scores for a startup
router.post('/calculate', async (req, res) => {
  try {
    const { startupId, forceUpdate } = scoreStartupSchema.parse(req.body)

    const startup = await prisma.agriTechStartup.findUnique({
      where: { id: startupId },
      include: {
        techScoreData: true,
        socialScoreData: true,
        giAnalysisData: true,
        metrics: true
      }
    })

    if (!startup) {
      return res.status(404).json({
        success: false,
        error: 'Startup not found'
      })
    }

    // Check if we need to update scores
    const shouldUpdate = forceUpdate || 
      !startup.techScoreData || 
      !startup.socialScoreData ||
      (startup.techScoreData && isScoreStale(startup.techScoreData.lastUpdated)) ||
      (startup.socialScoreData && isScoreStale(startup.socialScoreData.lastUpdated))

    if (!shouldUpdate) {
      return res.json({
        success: true,
        data: {
          startupId,
          techScore: startup.techScoreData,
          socialScore: startup.socialScoreData,
          giScore: startup.giAnalysisData,
          metrics: startup.metrics,
          overallScore: startup.overallScore,
          cached: true
        }
      })
    }

    // Calculate tech score if GitHub URL exists
    let techScore = null
    if (startup.githubUrl) {
      techScore = await calculateTechScore(startup.githubUrl, startupId)
    }

    // Calculate social score if Twitter URL exists
    let socialScore = null
    if (startup.twitterUrl) {
      socialScore = await calculateSocialScore(startup.twitterUrl, startupId)
    }

    // Calculate overall score with new weights
    const overallScore = calculateOverallScore(techScore, socialScore, startup.giAnalysisData)

    // Update startup with new scores
    const updatedStartup = await prisma.agriTechStartup.update({
      where: { id: startupId },
      data: {
        techScore: techScore?.score || 0,
        socialScore: socialScore?.score || 0,
        overallScore
      },
      include: {
        techScoreData: true,
        socialScoreData: true,
        giAnalysisData: true,
        metrics: true
      }
    })

    res.json({
      success: true,
      data: {
        startupId,
        techScore,
        socialScore,
        giScore: updatedStartup.giAnalysisData,
        metrics: updatedStartup.metrics,
        overallScore,
        cached: false
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      })
    }

    console.error('Error calculating scores:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to calculate scores'
    })
  }
})

// Helper function to calculate tech score with new weighted metrics
async function calculateTechScore(githubUrl: string, startupId: string) {
  try {
    // Extract owner/repo from GitHub URL
    const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
    if (!match) {
      throw new Error('Invalid GitHub URL')
    }

    const [, owner, repo] = match
    const githubToken = process.env.GITHUB_TOKEN

    if (!githubToken) {
      throw new Error('GitHub token not configured')
    }

    // Fetch repository data
    const [repoData, commits, prs, issues] = await Promise.all([
      axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: { Authorization: `token ${githubToken}` }
      }),
      axios.get(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=100`, {
        headers: { Authorization: `token ${githubToken}` }
      }),
      axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=100`, {
        headers: { Authorization: `token ${githubToken}` }
      }),
      axios.get(`https://api.github.com/repos/${owner}/${repo}/issues?state=all&per_page=100`, {
        headers: { Authorization: `token ${githubToken}` }
      })
    ])

    // Calculate individual metrics with new weights
    const codeActivity = calculateCodeActivity(commits.data) // Weight: 30%
    const communityEngagement = calculateCommunityEngagement(repoData.data) // Weight: 25%
    const projectMaintenance = calculateProjectMaintenance(prs.data, issues.data) // Weight: 25%
    const codeQuality = calculateCodeQuality(repoData.data) // Weight: 20%

    // Calculate overall tech score with weights
    const score = Math.round(
      codeActivity * 0.30 +
      communityEngagement * 0.25 +
      projectMaintenance * 0.25 +
      codeQuality * 0.20
    )

    // Save to database
    const techScore = await prisma.techScore.upsert({
      where: { startupId },
      update: {
        score,
        codeActivity,
        communityEngagement,
        projectMaintenance,
        codeQuality,
        lastUpdated: new Date()
      },
      create: {
        startupId,
        score,
        codeActivity,
        communityEngagement,
        projectMaintenance,
        codeQuality
      }
    })

    // Update startup metrics
    await prisma.agriTechMetrics.upsert({
      where: { startupId },
      update: {
        githubStars: repoData.data.stargazers_count,
        githubForks: repoData.data.forks_count,
        githubCommits: commits.data.length,
        githubPrs: prs.data.length,
        githubIssues: issues.data.length,
        lastUpdated: new Date()
      },
      create: {
        startupId,
        githubStars: repoData.data.stargazers_count,
        githubForks: repoData.data.forks_count,
        githubCommits: commits.data.length,
        githubPrs: prs.data.length,
        githubIssues: issues.data.length
      }
    })

    return techScore
  } catch (error) {
    console.error('Error calculating tech score:', error)
    throw error
  }
}

// Helper function to calculate social score with new weighted metrics
async function calculateSocialScore(twitterUrl: string, startupId: string) {
  try {
    // Extract username from Twitter URL
    const match = twitterUrl.match(/twitter\.com\/([^\/\?]+)/)
    if (!match) {
      throw new Error('Invalid Twitter URL')
    }

    const username = match[1]
    const twitterToken = process.env.TWITTER_BEARER_TOKEN

    if (!twitterToken) {
      throw new Error('Twitter token not configured')
    }

    // Fetch user data and recent tweets
    const [userData, tweets] = await Promise.all([
      axios.get(`https://api.twitter.com/2/users/by/username/${username}`, {
        headers: { Authorization: `Bearer ${twitterToken}` },
        params: {
          'user.fields': 'public_metrics,verified'
        }
      }),
      axios.get(`https://api.twitter.com/2/users/by/username/${username}/tweets`, {
        headers: { Authorization: `Bearer ${twitterToken}` },
        params: {
          'tweet.fields': 'public_metrics,created_at',
          'max_results': 100
        }
      })
    ])

    const user = userData.data.data
    const userTweets = tweets.data.data || []

    // Calculate individual metrics with new weights
    const reach = calculateReach(user.public_metrics) // Weight: 40%
    const engagement = calculateEngagement(userTweets) // Weight: 35%
    const activity = calculateActivity(userTweets) // Weight: 25%

    // Calculate overall social score with weights
    const score = Math.round(
      reach * 0.40 +
      engagement * 0.35 +
      activity * 0.25
    )

    // Save to database
    const socialScore = await prisma.socialScore.upsert({
      where: { startupId },
      update: {
        score,
        reach,
        engagement,
        activity,
        lastUpdated: new Date()
      },
      create: {
        startupId,
        score,
        reach,
        engagement,
        activity
      }
    })

    // Update startup metrics
    await prisma.agriTechMetrics.upsert({
      where: { startupId },
      update: {
        twitterFollowers: user.public_metrics.followers_count,
        twitterTweets: user.public_metrics.tweet_count,
        twitterEngagement: engagement,
        lastUpdated: new Date()
      },
      create: {
        startupId,
        twitterFollowers: user.public_metrics.followers_count,
        twitterTweets: user.public_metrics.tweet_count,
        twitterEngagement: engagement
      }
    })

    return socialScore
  } catch (error) {
    console.error('Error calculating social score:', error)
    throw error
  }
}

// Helper functions for new weighted tech score calculations
function calculateCodeActivity(commits: any[]): number {
  if (commits.length === 0) return 0
  
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  
  const recentCommits = commits.filter(commit => 
    new Date(commit.commit.author.date) > thirtyDaysAgo
  )
  
  const frequency = recentCommits.length / 30 // commits per day
  return Math.min(Math.round(frequency * 25), 100) // Scale to 0-100
}

function calculateCommunityEngagement(repoData: any): number {
  // Based on stars, forks, and watchers
  const engagement = (repoData.stargazers_count * 0.5) + 
                    (repoData.forks_count * 0.3) + 
                    (repoData.watchers_count * 0.2)
  
  return Math.min(Math.round(engagement / 10), 100) // Scale down
}

function calculateProjectMaintenance(prs: any[], issues: any[]): number {
  if (prs.length === 0 && issues.length === 0) return 0
  
  const mergedPRs = prs.filter(pr => pr.merged_at)
  const closedIssues = issues.filter(issue => issue.state === 'closed')
  
  const prMaintenance = prs.length > 0 ? (mergedPRs.length / prs.length) * 50 : 0
  const issueMaintenance = issues.length > 0 ? (closedIssues.length / issues.length) * 50 : 0
  
  return Math.round(prMaintenance + issueMaintenance)
}

function calculateCodeQuality(repoData: any): number {
  // Simple heuristic based on repository metrics
  let score = 0
  
  if (repoData.stargazers_count > 100) score += 20
  if (repoData.forks_count > 10) score += 20
  if (repoData.open_issues_count < 10) score += 20
  if (repoData.size > 1000) score += 20 // Indicates substantial codebase
  if (repoData.language) score += 20 // Has a primary language
  
  return Math.min(score, 100)
}

// Helper functions for new weighted social score calculations
function calculateReach(metrics: any): number {
  // Based on follower count and verification
  let score = Math.min(Math.round(metrics.followers_count / 1000), 50)
  
  // Add bonus for verified accounts
  if (metrics.verified) score += 20
  
  return Math.min(score, 100)
}

function calculateEngagement(tweets: any[]): number {
  if (tweets.length === 0) return 0
  
  const totalEngagement = tweets.reduce((sum, tweet) => {
    const metrics = tweet.public_metrics
    return sum + metrics.like_count + metrics.retweet_count + metrics.reply_count
  }, 0)
  
  const avgEngagement = totalEngagement / tweets.length
  return Math.min(Math.round(avgEngagement / 10), 100) // Scale down
}

function calculateActivity(tweets: any[]): number {
  if (tweets.length === 0) return 0
  
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  
  const recentTweets = tweets.filter(tweet => 
    new Date(tweet.created_at) > thirtyDaysAgo
  )
  
  const frequency = recentTweets.length / 30 // tweets per day
  return Math.min(Math.round(frequency * 20), 100) // Scale to 0-100
}

function calculateOverallScore(techScore: any, socialScore: any, giScore: any): number {
  const tech = techScore?.score || 0
  const social = socialScore?.score || 0
  const gi = giScore?.marketPotential || 0
  
  // New weights: 40% tech, 30% social, 30% GI
  return Math.round(tech * 0.40 + social * 0.30 + gi * 0.30)
}

function isScoreStale(lastUpdated: Date): boolean {
  const now = new Date()
  const hoursSinceUpdate = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60)
  return hoursSinceUpdate > 24 // Consider stale after 24 hours
}

export default router