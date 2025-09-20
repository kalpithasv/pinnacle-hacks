import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import cron from 'node-cron'
import { Queue } from 'bull'
import Redis from 'redis'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3002

// Redis connection
const redis = Redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
})

// Bull queue for scoring jobs
const scoringQueue = new Queue('scoring', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379')
  }
})

// Middleware
app.use(helmet())
app.use(cors())
app.use(morgan('combined'))
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'scoring-service',
    timestamp: new Date().toISOString()
  })
})

// Queue status endpoint
app.get('/queue/status', async (req, res) => {
  try {
    const [waiting, active, completed, failed] = await Promise.all([
      scoringQueue.getWaiting(),
      scoringQueue.getActive(),
      scoringQueue.getCompleted(),
      scoringQueue.getFailed()
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

// Add scoring job to queue
app.post('/score', async (req, res) => {
  try {
    const { projectId, type, priority = 'normal' } = req.body

    if (!projectId || !type) {
      return res.status(400).json({
        success: false,
        error: 'projectId and type are required'
      })
    }

    const job = await scoringQueue.add('score-project', {
      projectId,
      type, // 'tech', 'social', or 'both'
      priority
    }, {
      priority: priority === 'high' ? 1 : priority === 'low' ? 3 : 2,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    })

    res.json({
      success: true,
      data: {
        jobId: job.id,
        projectId,
        type
      }
    })
  } catch (error) {
    console.error('Error adding scoring job:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to add scoring job'
    })
  }
})

// Process scoring jobs
scoringQueue.process('score-project', async (job) => {
  const { projectId, type } = job.data
  
  console.log(`Processing scoring job for project ${projectId}, type: ${type}`)
  
  try {
    // This would integrate with the actual scoring logic
    // For now, we'll simulate the scoring process
    
    if (type === 'tech' || type === 'both') {
      await scoreTechMetrics(projectId)
    }
    
    if (type === 'social' || type === 'both') {
      await scoreSocialMetrics(projectId)
    }
    
    console.log(`Successfully scored project ${projectId}`)
  } catch (error) {
    console.error(`Error scoring project ${projectId}:`, error)
    throw error
  }
})

// Scheduled scoring job - runs every 6 hours
cron.schedule('0 */6 * * *', async () => {
  console.log('Running scheduled scoring job...')
  
  try {
    // This would fetch all projects that need scoring updates
    // and add them to the queue
    
    // For now, we'll add a sample job
    await scoringQueue.add('score-project', {
      projectId: 'sample-project',
      type: 'both',
      priority: 'low'
    })
    
    console.log('Scheduled scoring job completed')
  } catch (error) {
    console.error('Error in scheduled scoring job:', error)
  }
})

// Helper functions (these would integrate with actual APIs)
async function scoreTechMetrics(projectId: string) {
  // Simulate GitHub API calls and scoring
  console.log(`Scoring tech metrics for project ${projectId}`)
  
  // In a real implementation, this would:
  // 1. Fetch project data from database
  // 2. Call GitHub API to get repository metrics
  // 3. Calculate tech score based on commits, PRs, issues, etc.
  // 4. Update database with new scores
  
  await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API calls
}

async function scoreSocialMetrics(projectId: string) {
  // Simulate Twitter API calls and scoring
  console.log(`Scoring social metrics for project ${projectId}`)
  
  // In a real implementation, this would:
  // 1. Fetch project data from database
  // 2. Call Twitter API to get social metrics
  // 3. Calculate social score based on engagement, followers, etc.
  // 4. Update database with new scores
  
  await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API calls
}

// Error handling
scoringQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message)
})

scoringQueue.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`)
})

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down scoring service...')
  await scoringQueue.close()
  await redis.quit()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('Shutting down scoring service...')
  await scoringQueue.close()
  await redis.quit()
  process.exit(0)
})

app.listen(PORT, () => {
  console.log(`🔢 Scoring service running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
})

export default app

