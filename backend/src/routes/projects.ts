import express from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const router: express.Router = express.Router()
const prisma = new PrismaClient()

// Validation schemas
const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  githubUrl: z.string().url().optional(),
  twitterUrl: z.string().url().optional(),
  website: z.string().url().optional(),
  location: z.string().optional(),
  industry: z.string().min(1),
  stage: z.enum(['idea', 'mvp', 'early', 'growth', 'scale']),
  fundingGoal: z.number().positive().optional(),
  currentFunding: z.number().min(0).optional(),
  teamSize: z.number().positive(),
  foundedYear: z.number().min(1900).max(new Date().getFullYear()),
  tags: z.array(z.string()).optional()
})

const updateProjectSchema = createProjectSchema.partial()

// GET /api/projects - Get all projects with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = '1',
      limit = '20',
      search,
      industry,
      stage,
      minScore,
      maxScore,
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
        { tags: { has: search as string } }
      ]
    }
    
    if (industry) {
      where.industry = industry
    }
    
    if (stage) {
      where.stage = stage
    }
    
    if (minScore || maxScore) {
      where.overallScore = {}
      if (minScore) where.overallScore.gte = parseInt(minScore as string)
      if (maxScore) where.overallScore.lte = parseInt(maxScore as string)
    }

    // Build orderBy clause
    const orderBy: any = {}
    orderBy[sortBy as string] = sortOrder

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limitNum,
        orderBy,
        include: {
          metrics: true,
          techScoreData: true,
          socialScoreData: true
        }
      }),
      prisma.project.count({ where })
    ])

    res.json({
      success: true,
      data: projects,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    })
  } catch (error) {
    console.error('Error fetching projects:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch projects'
    })
  }
})

// GET /api/projects/:id - Get project by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        metrics: true,
        techScoreData: true,
        socialScoreData: true,
        matches: {
          include: {
            investor: true
          }
        }
      }
    })

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      })
    }

    res.json({
      success: true,
      data: project
    })
  } catch (error) {
    console.error('Error fetching project:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project'
    })
  }
})

// POST /api/projects - Create new project
router.post('/', async (req, res) => {
  try {
    const validatedData = createProjectSchema.parse(req.body)

    const project = await prisma.project.create({
      data: {
        ...validatedData,
        tags: validatedData.tags || []
      },
      include: {
        metrics: true,
        techScoreData: true,
        socialScoreData: true
      }
    })

    res.status(201).json({
      success: true,
      data: project
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      })
    }

    console.error('Error creating project:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create project'
    })
  }
})

// PUT /api/projects/:id - Update project
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const validatedData = updateProjectSchema.parse(req.body)

    const project = await prisma.project.update({
      where: { id },
      data: validatedData,
      include: {
        metrics: true,
        techScoreData: true,
        socialScoreData: true
      }
    })

    res.json({
      success: true,
      data: project
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      })
    }

    console.error('Error updating project:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update project'
    })
  }
})

// DELETE /api/projects/:id - Delete project
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    await prisma.project.delete({
      where: { id }
    })

    res.json({
      success: true,
      message: 'Project deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting project:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete project'
    })
  }
})

// GET /api/projects/:id/metrics - Get project metrics
router.get('/:id/metrics', async (req, res) => {
  try {
    const { id } = req.params

    const metrics = await prisma.projectMetrics.findUnique({
      where: { projectId: id }
    })

    if (!metrics) {
      return res.status(404).json({
        success: false,
        error: 'Metrics not found'
      })
    }

    res.json({
      success: true,
      data: metrics
    })
  } catch (error) {
    console.error('Error fetching metrics:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch metrics'
    })
  }
})

export default router
