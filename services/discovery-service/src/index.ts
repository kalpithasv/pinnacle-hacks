import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import cron from 'node-cron'
import { Queue } from 'bull'
import Redis from 'redis'
import axios from 'axios'
import * as cheerio from 'cheerio'
import puppeteer from 'puppeteer'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3003

// Redis connection
const redis = Redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
})

// Bull queue for discovery jobs
const discoveryQueue = new Queue('discovery', {
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
    service: 'discovery-service',
    timestamp: new Date().toISOString()
  })
})

// Queue status endpoint
app.get('/queue/status', async (req, res) => {
  try {
    const [waiting, active, completed, failed] = await Promise.all([
      discoveryQueue.getWaiting(),
      discoveryQueue.getActive(),
      discoveryQueue.getCompleted(),
      discoveryQueue.getFailed()
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

// Start discovery job
app.post('/discover', async (req, res) => {
  try {
    const { location, radius = 10, industry, priority = 'normal' } = req.body

    if (!location) {
      return res.status(400).json({
        success: false,
        error: 'Location is required'
      })
    }

    const job = await discoveryQueue.add('discover-businesses', {
      location,
      radius,
      industry,
      priority
    }, {
      priority: priority === 'high' ? 1 : priority === 'low' ? 3 : 2,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000
      }
    })

    res.json({
      success: true,
      data: {
        jobId: job.id,
        location,
        radius,
        industry
      }
    })
  } catch (error) {
    console.error('Error adding discovery job:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to add discovery job'
    })
  }
})

// Process discovery jobs
discoveryQueue.process('discover-businesses', async (job) => {
  const { location, radius, industry } = job.data
  
  console.log(`Processing discovery job for location: ${location}`)
  
  try {
    const discoveries = await discoverBusinessesInLocation(location, radius, industry)
    
    // Save discoveries to database (this would integrate with the main API)
    for (const discovery of discoveries) {
      await saveDiscovery(discovery)
    }
    
    console.log(`Successfully discovered ${discoveries.length} businesses in ${location}`)
    
    return { discoveries: discoveries.length }
  } catch (error) {
    console.error(`Error discovering businesses in ${location}:`, error)
    throw error
  }
})

// Scheduled discovery job - runs every 12 hours
cron.schedule('0 */12 * * *', async () => {
  console.log('Running scheduled discovery job...')
  
  try {
    // This would fetch locations to scan from database
    const locations = ['San Francisco, CA', 'Austin, TX', 'Boston, MA', 'Seattle, WA']
    
    for (const location of locations) {
      await discoveryQueue.add('discover-businesses', {
        location,
        radius: 10,
        priority: 'low'
      })
    }
    
    console.log('Scheduled discovery job completed')
  } catch (error) {
    console.error('Error in scheduled discovery job:', error)
  }
})

// Helper function to discover businesses in a location
async function discoverBusinessesInLocation(
  location: string, 
  radius: number, 
  industry?: string
) {
  const discoveries = []
  
  try {
    // 1. Search for location-based tweets
    const twitterResults = await searchLocationBasedTweets(location, industry)
    discoveries.push(...twitterResults)
    
    // 2. Search for LinkedIn business profiles
    const linkedinResults = await searchLinkedInBusinesses(location, industry)
    discoveries.push(...linkedinResults)
    
    // 3. Search for Google My Business listings
    const googleResults = await searchGoogleBusinesses(location, radius, industry)
    discoveries.push(...googleResults)
    
    // 4. Apply AI/ML filtering to identify startup-like businesses
    const filteredDiscoveries = await filterStartupBusinesses(discoveries)
    
    return filteredDiscoveries
  } catch (error) {
    console.error('Error in business discovery:', error)
    return []
  }
}

// Search for location-based tweets
async function searchLocationBasedTweets(location: string, industry?: string) {
  const discoveries = []
  
  try {
    // This would use Twitter API v2 with location filtering
    // For now, we'll simulate the results
    
    const mockTweets = [
      {
        text: `Just launched our new AI startup in ${location}! Looking for investors.`,
        user: 'techfounder123',
        location: location,
        timestamp: new Date().toISOString()
      },
      {
        text: `Excited to announce our climate tech solution is now live in ${location}!`,
        user: 'greentech_co',
        location: location,
        timestamp: new Date().toISOString()
      }
    ]
    
    for (const tweet of mockTweets) {
      if (isBusinessRelated(tweet.text)) {
        discoveries.push({
          location,
          businessName: extractBusinessName(tweet.text),
          socialMediaUrl: `https://twitter.com/${tweet.user}`,
          description: tweet.text,
          industry: industry || inferIndustry(tweet.text),
          confidence: calculateConfidence(tweet.text, location),
          status: 'pending'
        })
      }
    }
    
    return discoveries
  } catch (error) {
    console.error('Error searching Twitter:', error)
    return []
  }
}

// Search for LinkedIn business profiles
async function searchLinkedInBusinesses(location: string, industry?: string) {
  const discoveries = []
  
  try {
    // This would use LinkedIn API or web scraping
    // For now, we'll simulate the results
    
    const mockCompanies = [
      {
        name: 'TechStart Solutions',
        description: 'AI-powered software development platform',
        location: location,
        industry: 'Developer Tools',
        linkedinUrl: 'https://linkedin.com/company/techstart-solutions'
      },
      {
        name: 'GreenTech Innovations',
        description: 'Sustainable technology for environmental monitoring',
        location: location,
        industry: 'Climate Tech',
        linkedinUrl: 'https://linkedin.com/company/greentech-innovations'
      }
    ]
    
    for (const company of mockCompanies) {
      if (!industry || company.industry === industry) {
        discoveries.push({
          location,
          businessName: company.name,
          socialMediaUrl: company.linkedinUrl,
          description: company.description,
          industry: company.industry,
          confidence: 0.8 + Math.random() * 0.2,
          status: 'pending'
        })
      }
    }
    
    return discoveries
  } catch (error) {
    console.error('Error searching LinkedIn:', error)
    return []
  }
}

// Search for Google My Business listings
async function searchGoogleBusinesses(location: string, radius: number, industry?: string) {
  const discoveries = []
  
  try {
    // This would use Google Places API
    // For now, we'll simulate the results
    
    const mockBusinesses = [
      {
        name: 'HealthSync Technologies',
        description: 'Digital health platform for patient data management',
        location: location,
        industry: 'HealthTech',
        website: 'https://healthsync.tech'
      }
    ]
    
    for (const business of mockBusinesses) {
      if (!industry || business.industry === industry) {
        discoveries.push({
          location,
          businessName: business.name,
          socialMediaUrl: business.website,
          description: business.description,
          industry: business.industry,
          confidence: 0.7 + Math.random() * 0.3,
          status: 'pending'
        })
      }
    }
    
    return discoveries
  } catch (error) {
    console.error('Error searching Google:', error)
    return []
  }
}

// Apply AI/ML filtering to identify startup-like businesses
async function filterStartupBusinesses(discoveries: any[]) {
  // This would use AI/ML models to filter out non-startup businesses
  // For now, we'll use simple heuristics
  
  return discoveries.filter(discovery => {
    const text = `${discovery.businessName} ${discovery.description}`.toLowerCase()
    
    // Look for startup indicators
    const startupKeywords = [
      'startup', 'tech', 'innovation', 'platform', 'solution',
      'ai', 'machine learning', 'blockchain', 'saas', 'api',
      'funding', 'investor', 'venture', 'accelerator'
    ]
    
    return startupKeywords.some(keyword => text.includes(keyword))
  })
}

// Helper functions
function isBusinessRelated(text: string): boolean {
  const businessKeywords = [
    'startup', 'company', 'business', 'launched', 'funding',
    'investor', 'tech', 'innovation', 'platform', 'solution'
  ]
  
  return businessKeywords.some(keyword => 
    text.toLowerCase().includes(keyword)
  )
}

function extractBusinessName(text: string): string {
  // Simple extraction - in real implementation, use NLP
  const words = text.split(' ')
  const nameWords = words.slice(0, 3) // Take first 3 words as potential name
  return nameWords.join(' ')
}

function inferIndustry(text: string): string {
  const textLower = text.toLowerCase()
  
  if (textLower.includes('ai') || textLower.includes('machine learning')) {
    return 'AI/ML'
  }
  if (textLower.includes('climate') || textLower.includes('green')) {
    return 'Climate Tech'
  }
  if (textLower.includes('health') || textLower.includes('medical')) {
    return 'HealthTech'
  }
  if (textLower.includes('fintech') || textLower.includes('finance')) {
    return 'FinTech'
  }
  
  return 'Technology'
}

function calculateConfidence(text: string, location: string): number {
  let confidence = 0.5
  
  // Increase confidence based on indicators
  if (text.toLowerCase().includes('startup')) confidence += 0.2
  if (text.toLowerCase().includes('funding')) confidence += 0.1
  if (text.toLowerCase().includes('investor')) confidence += 0.1
  if (text.toLowerCase().includes(location.toLowerCase())) confidence += 0.1
  
  return Math.min(confidence, 1.0)
}

async function saveDiscovery(discovery: any) {
  // This would save to the main database via API call
  try {
    await axios.post(`${process.env.API_BASE_URL}/api/discovery`, discovery)
  } catch (error) {
    console.error('Error saving discovery:', error)
  }
}

// Error handling
discoveryQueue.on('failed', (job, err) => {
  console.error(`Discovery job ${job.id} failed:`, err.message)
})

discoveryQueue.on('completed', (job, result) => {
  console.log(`Discovery job ${job.id} completed: ${result.discoveries} businesses found`)
})

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down discovery service...')
  await discoveryQueue.close()
  await redis.quit()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('Shutting down discovery service...')
  await discoveryQueue.close()
  await redis.quit()
  process.exit(0)
})

app.listen(PORT, () => {
  console.log(`🔍 Discovery service running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
})

export default app

