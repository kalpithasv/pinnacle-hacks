import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import cron from 'node-cron'
import { Queue } from 'bull'
import Redis from 'redis'
import axios from 'axios'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3004

// Redis connection
const redis = Redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
})

// Bull queue for matchmaking jobs
const matchmakingQueue = new Queue('matchmaking', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379')
  }
})

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

// Middleware
app.use(helmet())
app.use(cors())
app.use(morgan('combined'))
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'matchmaking-service',
    timestamp: new Date().toISOString()
  })
})

// Queue status endpoint
app.get('/queue/status', async (req, res) => {
  try {
    const [waiting, active, completed, failed] = await Promise.all([
      matchmakingQueue.getWaiting(),
      matchmakingQueue.getActive(),
      matchmakingQueue.getCompleted(),
      matchmakingQueue.getFailed()
    ])

    res.json({
      success: true,
      data: {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get queue status'
    })
  }
})

// Generate matches for an investor
app.post('/generate-matches', async (req, res) => {
  try {
    const { investorId, limit = 10, priority = 'normal' } = req.body

    if (!investorId) {
      return res.status(400).json({
        success: false,
        error: 'investorId is required'
      })
    }

    const job = await matchmakingQueue.add('generate-matches', {
      investorId,
      limit,
      priority
    }, {
      priority: priority === 'high' ? 1 : priority === 'low' ? 3 : 2,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 3000
      }
    })

    res.json({
      success: true,
      data: {
        jobId: job.id,
        investorId,
        limit
      }
    })
  } catch (error) {
    console.error('Error adding matchmaking job:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to add matchmaking job'
    })
  }
})

// Process matchmaking jobs
matchmakingQueue.process('generate-matches', async (job) => {
  const { investorId, limit } = job.data
  
  console.log(`Processing matchmaking job for investor ${investorId}`)
  
  try {
    const matches = await generateMatchesForInvestor(investorId, limit)
    
    // Save matches to database
    for (const match of matches) {
      await saveMatch(match)
    }
    
    console.log(`Successfully generated ${matches.length} matches for investor ${investorId}`)
    
    return { matches: matches.length }
  } catch (error) {
    console.error(`Error generating matches for investor ${investorId}:`, error)
    throw error
  }
})

// Scheduled matchmaking job - runs every 4 hours
cron.schedule('0 */4 * * *', async () => {
  console.log('Running scheduled matchmaking job...')
  
  try {
    // This would fetch all active investors from database
    const investors = await getActiveInvestors()
    
    for (const investor of investors) {
      await matchmakingQueue.add('generate-matches', {
        investorId: investor.id,
        limit: 5,
        priority: 'low'
      })
    }
    
    console.log(`Scheduled matchmaking job completed for ${investors.length} investors`)
  } catch (error) {
    console.error('Error in scheduled matchmaking job:', error)
  }
})

// Generate matches for a specific investor
async function generateMatchesForInvestor(investorId: string, limit: number) {
  try {
    // 1. Get investor data
    const investor = await getInvestorData(investorId)
    if (!investor) {
      throw new Error('Investor not found')
    }

    // 2. Get potential projects
    const potentialProjects = await getPotentialProjects(investor, limit * 2)
    
    // 3. Use AI to score and rank matches
    const scoredMatches = await scoreMatchesWithAI(investor, potentialProjects)
    
    // 4. Return top matches
    return scoredMatches.slice(0, limit)
  } catch (error) {
    console.error('Error generating matches:', error)
    throw error
  }
}

// Get investor data from main API
async function getInvestorData(investorId: string) {
  try {
    const response = await axios.get(`${process.env.API_BASE_URL}/api/investors/${investorId}`)
    return response.data.data
  } catch (error) {
    console.error('Error fetching investor data:', error)
    return null
  }
}

// Get potential projects based on investor preferences
async function getPotentialProjects(investor: any, limit: number) {
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      industry: investor.preferredIndustries.join(','),
      stage: investor.preferredStages.join(','),
      minScore: Math.max(investor.techScoreMin, investor.socialScoreMin).toString()
    })

    const response = await axios.get(`${process.env.API_BASE_URL}/api/projects?${params}`)
    return response.data.data
  } catch (error) {
    console.error('Error fetching potential projects:', error)
    return []
  }
}

// Use AI to score and rank matches
async function scoreMatchesWithAI(investor: any, projects: any[]) {
  const matches = []
  
  for (const project of projects) {
    try {
      // Calculate basic compatibility score
      const basicScore = calculateBasicCompatibility(investor, project)
      
      // Use AI to generate detailed match reasons
      const aiAnalysis = await analyzeMatchWithAI(investor, project)
      
      // Combine basic score with AI insights
      const finalScore = Math.round(basicScore * 0.7 + aiAnalysis.score * 0.3)
      
      matches.push({
        investorId: investor.id,
        projectId: project.id,
        score: finalScore,
        reasons: aiAnalysis.reasons,
        status: 'pending'
      })
    } catch (error) {
      console.error(`Error analyzing match for project ${project.id}:`, error)
    }
  }
  
  // Sort by score (highest first)
  return matches.sort((a, b) => b.score - a.score)
}

// Calculate basic compatibility score
function calculateBasicCompatibility(investor: any, project: any): number {
  let score = 0
  let factors = 0

  // Industry match (30% weight)
  if (investor.preferredIndustries.includes(project.industry)) {
    score += 30
  }
  factors++

  // Stage match (25% weight)
  if (investor.preferredStages.includes(project.stage)) {
    score += 25
  }
  factors++

  // Tech score (20% weight)
  const techScoreRatio = project.techScore / 100
  score += techScoreRatio * 20
  factors++

  // Social score (15% weight)
  const socialScoreRatio = project.socialScore / 100
  score += socialScoreRatio * 15
  factors++

  // Team size (5% weight)
  if (project.teamSize >= investor.teamSizeMin) {
    score += 5
  }
  factors++

  // Funding range (5% weight)
  if (project.fundingGoal && 
      project.fundingGoal >= investor.investmentRangeMin && 
      project.fundingGoal <= investor.investmentRangeMax) {
    score += 5
  }
  factors++

  return Math.round(score)
}

// Use Gemini AI to analyze match
async function analyzeMatchWithAI(investor: any, project: any) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    
    const prompt = `
    Analyze the compatibility between an investor and a startup project. Provide a score (0-100) and 3-5 specific reasons why this is a good match.

    Investor Profile:
    - Name: ${investor.name}
    - Company: ${investor.company}
    - Investment Range: $${investor.investmentRangeMin.toLocaleString()} - $${investor.investmentRangeMax.toLocaleString()}
    - Preferred Industries: ${investor.preferredIndustries.join(', ')}
    - Preferred Stages: ${investor.preferredStages.join(', ')}
    - Minimum Tech Score: ${investor.techScoreMin}
    - Minimum Social Score: ${investor.socialScoreMin}
    - Bio: ${investor.bio || 'No bio provided'}

    Project Profile:
    - Name: ${project.name}
    - Description: ${project.description}
    - Industry: ${project.industry}
    - Stage: ${project.stage}
    - Tech Score: ${project.techScore}/100
    - Social Score: ${project.socialScore}/100
    - Team Size: ${project.teamSize}
    - Founded Year: ${project.foundedYear}
    - Funding Goal: $${project.fundingGoal?.toLocaleString() || 'Not specified'}
    - Current Funding: $${project.currentFunding?.toLocaleString() || 'Not specified'}
    - Location: ${project.location}

    Please respond in JSON format:
    {
      "score": <number between 0-100>,
      "reasons": [
        "<specific reason 1>",
        "<specific reason 2>",
        "<specific reason 3>",
        "<specific reason 4>",
        "<specific reason 5>"
      ]
    }
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0])
      return {
        score: Math.min(Math.max(analysis.score, 0), 100),
        reasons: analysis.reasons.slice(0, 5) // Limit to 5 reasons
      }
    } else {
      throw new Error('Invalid AI response format')
    }
  } catch (error) {
    console.error('Error in AI analysis:', error)
    
    // Fallback to basic analysis
    return {
      score: calculateBasicCompatibility(investor, project),
      reasons: [
        `Industry alignment: ${project.industry} matches investor preferences`,
        `Stage compatibility: ${project.stage} stage fits investment criteria`,
        `Strong tech score: ${project.techScore}/100 exceeds minimum requirements`,
        `Team size: ${project.teamSize} members meets minimum threshold`,
        `Location: ${project.location} in target market`
      ]
    }
  }
}

// Get active investors from main API
async function getActiveInvestors() {
  try {
    const response = await axios.get(`${process.env.API_BASE_URL}/api/investors?limit=50`)
    return response.data.data
  } catch (error) {
    console.error('Error fetching active investors:', error)
    return []
  }
}

// Save match to database
async function saveMatch(match: any) {
  try {
    await axios.post(`${process.env.API_BASE_URL}/api/matchmaking`, match)
  } catch (error) {
    console.error('Error saving match:', error)
  }
}

// Error handling
matchmakingQueue.on('failed', (job, err) => {
  console.error(`Matchmaking job ${job.id} failed:`, err.message)
})

matchmakingQueue.on('completed', (job, result) => {
  console.log(`Matchmaking job ${job.id} completed: ${result.matches} matches generated`)
})

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down matchmaking service...')
  await matchmakingQueue.close()
  await redis.quit()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('Shutting down matchmaking service...')
  await matchmakingQueue.close()
  await redis.quit()
  process.exit(0)
})

app.listen(PORT, () => {
  console.log(`💕 Matchmaking service running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
})

export default app

