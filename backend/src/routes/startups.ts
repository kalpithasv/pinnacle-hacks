import express from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth'
import axios from 'axios'

const router: express.Router = express.Router()
const prisma = new PrismaClient()

// Validation schemas
const createStartupSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  businessModel: z.string().min(1),
  targetMarket: z.string().min(1),
  expectedRevenue: z.number().positive().optional(),
  fundingRequired: z.number().positive().optional(),
  teamSize: z.number().positive().default(1),
  stage: z.enum(['idea', 'prototype', 'mvp', 'early', 'growth']),
  
  // Land Details
  landLocation: z.string().min(1),
  landArea: z.number().positive(),
  landOwnership: z.enum(['owned', 'leased', 'partnership']),
  landType: z.enum(['agricultural', 'horticultural', 'livestock', 'mixed', 'other']),
  
  // Technical Integration
  githubUrl: z.string().url().optional(),
  twitterUrl: z.string().url().optional(),
  website: z.string().url().optional(),
  
  tags: z.array(z.string()).optional()
})

const updateStartupSchema = createStartupSchema.partial()

// POST /api/startups - Create new AgriTech startup
router.post('/', authenticateToken, requireRole(['founder']), async (req: AuthRequest, res) => {
  try {
    const validatedData = createStartupSchema.parse(req.body)

    // Create startup
    const startup = await prisma.agriTechStartup.create({
      data: {
        ...validatedData,
        founderName: req.user!.name,
        founderEmail: req.user!.email,
        tags: validatedData.tags || []
      },
      include: {
        metrics: true,
        techScoreData: true,
        socialScoreData: true,
        giAnalysisData: true
      }
    })

    // Trigger GI Analysis with ADK
    if (startup.landLocation && startup.landType) {
      try {
        await triggerGIAnalysis(startup.id, {
          location: startup.landLocation,
          landType: startup.landType,
          businessModel: startup.businessModel,
          description: startup.description
        })
      } catch (error) {
        console.error('GI Analysis trigger failed:', error)
        // Don't fail the startup creation if GI analysis fails
      }
    }

    res.status(201).json({
      success: true,
      data: startup
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      })
    }

    console.error('Error creating startup:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create startup'
    })
  }
})

// GET /api/startups - Get all startups with filtering
router.get('/', async (req, res) => {
  try {
    const {
      page = '1',
      limit = '20',
      search,
      stage,
      landType,
      minScore,
      maxScore,
      giCertified,
      sortBy = 'overallScore',
      sortOrder = 'desc'
    } = req.query

    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { businessModel: { contains: search as string, mode: 'insensitive' } },
        { landLocation: { contains: search as string, mode: 'insensitive' } },
        { tags: { has: search as string } }
      ]
    }
    
    if (stage) {
      where.stage = stage
    }
    
    if (landType) {
      where.landType = landType
    }
    
    if (giCertified !== undefined) {
      where.giCertified = giCertified === 'true'
    }
    
    if (minScore || maxScore) {
      where.overallScore = {}
      if (minScore) where.overallScore.gte = parseInt(minScore as string)
      if (maxScore) where.overallScore.lte = parseInt(maxScore as string)
    }

    // Only show approved startups to public
    where.status = 'approved'

    // Build orderBy clause
    const orderBy: any = {}
    orderBy[sortBy as string] = sortOrder

    const [startups, total] = await Promise.all([
      prisma.agriTechStartup.findMany({
        where,
        skip,
        take: limitNum,
        orderBy,
        include: {
          metrics: true,
          techScoreData: true,
          socialScoreData: true,
          giAnalysisData: true,
          ratings: {
            select: {
              rating: true,
              category: true
            }
          }
        }
      }),
      prisma.agriTechStartup.count({ where })
    ])

    res.json({
      success: true,
      data: startups,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    })
  } catch (error) {
    console.error('Error fetching startups:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch startups'
    })
  }
})

// GET /api/startups/:id - Get startup by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const startup = await prisma.agriTechStartup.findUnique({
      where: { id },
      include: {
        metrics: true,
        techScoreData: true,
        socialScoreData: true,
        giAnalysisData: true,
        ratings: {
          include: {
            user: {
              select: {
                name: true,
                role: true
              }
            }
          }
        },
        matches: {
          include: {
            investor: {
              select: {
                name: true,
                company: true
              }
            }
          }
        }
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
      data: startup
    })
  } catch (error) {
    console.error('Error fetching startup:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch startup'
    })
  }
})

// PUT /api/startups/:id - Update startup
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const validatedData = updateStartupSchema.parse(req.body)

    // Check if user owns this startup or is admin
    const startup = await prisma.agriTechStartup.findUnique({
      where: { id }
    })

    if (!startup) {
      return res.status(404).json({
        success: false,
        error: 'Startup not found'
      })
    }

    if (startup.founderEmail !== req.user!.email && req.user!.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this startup'
      })
    }

    const updatedStartup = await prisma.agriTechStartup.update({
      where: { id },
      data: validatedData,
      include: {
        metrics: true,
        techScoreData: true,
        socialScoreData: true,
        giAnalysisData: true
      }
    })

    res.json({
      success: true,
      data: updatedStartup
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      })
    }

    console.error('Error updating startup:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update startup'
    })
  }
})

// POST /api/startups/:id/rate - Rate a startup
router.post('/:id/rate', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const { rating, review, category = 'overall' } = req.body

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      })
    }

    // Check if startup exists
    const startup = await prisma.agriTechStartup.findUnique({
      where: { id }
    })

    if (!startup) {
      return res.status(404).json({
        success: false,
        error: 'Startup not found'
      })
    }

    // Create or update rating
    const ratingRecord = await prisma.rating.upsert({
      where: {
        startupId_userId_category: {
          startupId: id,
          userId: req.user!.id,
          category
        }
      },
      update: {
        rating,
        review: review || null
      },
      create: {
        startupId: id,
        userId: req.user!.id,
        rating,
        review: review || null,
        category
      }
    })

    res.json({
      success: true,
      data: ratingRecord
    })
  } catch (error) {
    console.error('Error rating startup:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to rate startup'
    })
  }
})

// Helper function to trigger GI Analysis with ADK
async function triggerGIAnalysis(startupId: string, data: any) {
  try {
    const adkResponse = await axios.post(`${process.env.ADK_API_URL}/run`, {
      app_name: 'gi-analysis-agent',
      user_id: 'system',
      session_id: `startup-${startupId}`,
      new_message: {
        parts: [
          {
            text: `Analyze this AgriTech startup for Geographical Indication potential:
            
            Location: ${data.location}
            Land Type: ${data.landType}
            Business Model: ${data.businessModel}
            Description: ${data.description}
            
            Please provide:
            1. Identified GI products in the region
            2. Market potential analysis
            3. Uniqueness score
            4. Certification recommendations
            5. Geographical region analysis`
          }
        ],
        role: 'user'
      },
      streaming: false
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.ADK_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    // Process ADK response and save to database
    const analysisData = adkResponse.data
    
    // Extract GI products and scores from the response
    const giProducts = extractGIProducts(analysisData)
    const marketPotential = extractMarketPotential(analysisData)
    const uniquenessScore = extractUniquenessScore(analysisData)
    const geographicalRegion = extractGeographicalRegion(analysisData)

    // Save GI analysis to database
    await prisma.gIAnalysis.upsert({
      where: { startupId },
      update: {
        analysisData: JSON.stringify(analysisData),
        giProducts,
        geographicalRegion,
        marketPotential,
        uniquenessScore,
        certificationStatus: marketPotential > 70 ? 'recommended' : 'pending'
      },
      create: {
        startupId,
        analysisData: JSON.stringify(analysisData),
        giProducts,
        geographicalRegion,
        marketPotential,
        uniquenessScore,
        certificationStatus: marketPotential > 70 ? 'recommended' : 'pending'
      }
    })

    // Update startup with GI certification status
    await prisma.agriTechStartup.update({
      where: { id: startupId },
      data: {
        giCertified: marketPotential > 70,
        giProducts,
        giScore: Math.round((marketPotential + uniquenessScore) / 2)
      }
    })

  } catch (error) {
    console.error('ADK GI Analysis error:', error)
    throw error
  }
}

// Helper functions to extract data from ADK response
function extractGIProducts(analysisData: any): string[] {
  // This would parse the ADK response to extract GI products
  // For now, return mock data
  return ['Basmati Rice', 'Darjeeling Tea', 'Alphonso Mango']
}

function extractMarketPotential(analysisData: any): number {
  // Extract market potential score from ADK response
  return Math.floor(Math.random() * 40) + 60 // 60-100
}

function extractUniquenessScore(analysisData: any): number {
  // Extract uniqueness score from ADK response
  return Math.floor(Math.random() * 40) + 60 // 60-100
}

function extractGeographicalRegion(analysisData: any): string {
  // Extract geographical region from ADK response
  return 'Northern India'
}

export default router
