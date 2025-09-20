import express from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import axios from 'axios'

const router: express.Router = express.Router()
const prisma = new PrismaClient()

// Validation schemas
const discoverBusinessesSchema = z.object({
  location: z.string().min(1),
  radius: z.number().min(1).max(100).default(10), // km
  industry: z.string().optional(),
  limit: z.number().min(1).max(50).default(10)
})

const verifyDiscoverySchema = z.object({
  discoveryId: z.string(),
  status: z.enum(['verified', 'rejected']),
  projectData: z.object({
    name: z.string(),
    description: z.string(),
    industry: z.string(),
    website: z.string().url().optional(),
    githubUrl: z.string().url().optional(),
    twitterUrl: z.string().url().optional(),
    location: z.string(),
    teamSize: z.number().positive(),
    foundedYear: z.number().min(1900).max(new Date().getFullYear()),
    stage: z.enum(['idea', 'mvp', 'early', 'growth', 'scale']),
    tags: z.array(z.string()).optional()
  }).optional()
})

// GET /api/discovery - Get all discoveries with filtering
router.get('/', async (req, res) => {
  try {
    const {
      page = '1',
      limit = '20',
      location,
      industry,
      status,
      minConfidence,
      sortBy = 'discoveredAt',
      sortOrder = 'desc'
    } = req.query

    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    // Build where clause
    const where: any = {}
    
    if (location) {
      where.location = { contains: location as string, mode: 'insensitive' }
    }
    
    if (industry) {
      where.industry = industry
    }
    
    if (status) {
      where.status = status
    }
    
    if (minConfidence) {
      where.confidence = { gte: parseFloat(minConfidence as string) }
    }

    // Build orderBy clause
    const orderBy: any = {}
    orderBy[sortBy as string] = sortOrder

    const [discoveries, total] = await Promise.all([
      prisma.geoSocialDiscovery.findMany({
        where,
        skip,
        take: limitNum,
        orderBy
      }),
      prisma.geoSocialDiscovery.count({ where })
    ])

    res.json({
      success: true,
      data: discoveries,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    })
  } catch (error) {
    console.error('Error fetching discoveries:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch discoveries'
    })
  }
})

// GET /api/discovery/:id - Get discovery by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const discovery = await prisma.geoSocialDiscovery.findUnique({
      where: { id }
    })

    if (!discovery) {
      return res.status(404).json({
        success: false,
        error: 'Discovery not found'
      })
    }

    res.json({
      success: true,
      data: discovery
    })
  } catch (error) {
    console.error('Error fetching discovery:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch discovery'
    })
  }
})

// POST /api/discovery/discover - Discover new businesses in a location
router.post('/discover', async (req, res) => {
  try {
    const { location, radius, industry, limit } = discoverBusinessesSchema.parse(req.body)

    // This is a simplified implementation
    // In a real application, you would integrate with:
    // - Google Places API for business discovery
    // - Twitter API for location-based tweets
    // - LinkedIn API for business profiles
    // - Other social media APIs

    const discoveries = await discoverBusinessesInLocation(location, radius, industry, limit)

    // Save discoveries to database
    const savedDiscoveries = []
    for (const discovery of discoveries) {
      const saved = await prisma.geoSocialDiscovery.create({
        data: discovery
      })
      savedDiscoveries.push(saved)
    }

    res.json({
      success: true,
      data: savedDiscoveries,
      message: `Discovered ${savedDiscoveries.length} potential businesses`
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      })
    }

    console.error('Error discovering businesses:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to discover businesses'
    })
  }
})

// PUT /api/discovery/:id/verify - Verify or reject a discovery
router.put('/:id/verify', async (req, res) => {
  try {
    const { id } = req.params
    const { status, projectData } = verifyDiscoverySchema.parse(req.body)

    const discovery = await prisma.geoSocialDiscovery.findUnique({
      where: { id }
    })

    if (!discovery) {
      return res.status(404).json({
        success: false,
        error: 'Discovery not found'
      })
    }

    if (status === 'verified' && projectData) {
      // Create a new project from the verified discovery
      const project = await prisma.project.create({
        data: {
          name: projectData.name,
          description: projectData.description,
          industry: projectData.industry,
          website: projectData.website,
          githubUrl: projectData.githubUrl,
          twitterUrl: projectData.twitterUrl,
          location: projectData.location,
          teamSize: projectData.teamSize,
          foundedYear: projectData.foundedYear,
          stage: projectData.stage,
          tags: projectData.tags || [],
          isDiscovered: true
        }
      })

      // Update discovery status
      await prisma.geoSocialDiscovery.update({
        where: { id },
        data: { status: 'verified' }
      })

      res.json({
        success: true,
        data: {
          discovery: { ...discovery, status: 'verified' },
          project
        },
        message: 'Discovery verified and project created'
      })
    } else {
      // Reject the discovery
      await prisma.geoSocialDiscovery.update({
        where: { id },
        data: { status: 'rejected' }
      })

      res.json({
        success: true,
        data: { ...discovery, status: 'rejected' },
        message: 'Discovery rejected'
      })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      })
    }

    console.error('Error verifying discovery:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to verify discovery'
    })
  }
})

// DELETE /api/discovery/:id - Delete a discovery
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    await prisma.geoSocialDiscovery.delete({
      where: { id }
    })

    res.json({
      success: true,
      message: 'Discovery deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting discovery:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete discovery'
    })
  }
})

// POST /api/discovery/scan - Start automated scanning for a location
router.post('/scan', async (req, res) => {
  try {
    const { location, frequency = 'daily' } = req.body

    if (!location) {
      return res.status(400).json({
        success: false,
        error: 'Location is required'
      })
    }

    // In a real application, this would:
    // 1. Schedule a recurring job to scan the location
    // 2. Use services like Google Places API, Twitter API, etc.
    // 3. Apply AI/ML models to identify business-related content
    // 4. Store results in the database

    // For now, we'll simulate the discovery process
    const discoveries = await discoverBusinessesInLocation(location, 10, undefined, 5)

    const savedDiscoveries = []
    for (const discovery of discoveries) {
      const saved = await prisma.geoSocialDiscovery.create({
        data: discovery
      })
      savedDiscoveries.push(saved)
    }

    res.json({
      success: true,
      data: {
        location,
        frequency,
        discoveries: savedDiscoveries
      },
      message: `Started scanning ${location}. Found ${savedDiscoveries.length} potential businesses.`
    })
  } catch (error) {
    console.error('Error starting scan:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to start scanning'
    })
  }
})

// Helper function to discover businesses in a location
async function discoverBusinessesInLocation(
  location: string, 
  radius: number, 
  industry?: string, 
  limit: number = 10
) {
  // This is a mock implementation
  // In a real application, you would integrate with various APIs
  
  const mockDiscoveries = [
    {
      location,
      businessName: `TechStart ${Math.floor(Math.random() * 1000)}`,
      socialMediaUrl: `https://twitter.com/techstart${Math.floor(Math.random() * 1000)}`,
      description: 'AI-powered software development platform for startups',
      industry: industry || 'Developer Tools',
      confidence: 0.85 + Math.random() * 0.15,
      status: 'pending' as const
    },
    {
      location,
      businessName: `GreenTech ${Math.floor(Math.random() * 1000)}`,
      socialMediaUrl: `https://linkedin.com/company/greentech${Math.floor(Math.random() * 1000)}`,
      description: 'Sustainable technology solutions for environmental monitoring',
      industry: industry || 'Climate Tech',
      confidence: 0.75 + Math.random() * 0.20,
      status: 'pending' as const
    },
    {
      location,
      businessName: `HealthSync ${Math.floor(Math.random() * 1000)}`,
      socialMediaUrl: `https://facebook.com/healthsync${Math.floor(Math.random() * 1000)}`,
      description: 'Digital health platform for patient data management',
      industry: industry || 'HealthTech',
      confidence: 0.80 + Math.random() * 0.15,
      status: 'pending' as const
    }
  ]

  // Return a random subset
  const shuffled = mockDiscoveries.sort(() => 0.5 - Math.random())
  return shuffled.slice(0, Math.min(limit, shuffled.length))
}

export default router
