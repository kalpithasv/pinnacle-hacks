import express from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { authenticateToken, AuthRequest } from '../middleware/auth'
import adkService, { StartupAnalysisRequest } from '../services/adkService'
import pdfService from '../services/pdfService'

interface DbAnalysis {
  id: string;
  startupName: string;
  description: string;
  employeeCount: number;
  location: string;
  businessModel: string | null;
  targetMarket: string | null;
  landType: string | null;
  landArea: number | null;
  analysisData: string;
  generatedBy: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  generatedByUser: {
    name: string;
    email: string;
  };
}

const router: express.Router = express.Router()
const prisma = new PrismaClient()

// Validation schemas
const analysisRequestSchema = z.object({
  name: z.string().min(1, 'Startup name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  employeeCount: z.number().min(1, 'Employee count must be at least 1'),
  location: z.string().min(1, 'Location is required'),
  businessModel: z.string().optional(),
  targetMarket: z.string().optional(),
  landType: z.string().optional(),
  landArea: z.number().positive().optional()
})

// POST /api/analysis/generate - Generate startup analysis using ADK
router.post('/generate', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const validatedData = analysisRequestSchema.parse(req.body)

    // Create analysis request object
    const analysisRequest: StartupAnalysisRequest = {
      name: validatedData.name,
      description: validatedData.description,
      employeeCount: validatedData.employeeCount,
      location: validatedData.location,
      businessModel: validatedData.businessModel,
      targetMarket: validatedData.targetMarket,
      landType: validatedData.landType,
      landArea: validatedData.landArea
    }

    // Generate analysis using ADK
    const analysis = await adkService.generateStartupAnalysis(analysisRequest)

    // Save analysis to database
    const savedAnalysis = await prisma.startupAnalysis.create({
      data: {
        startupName: analysisRequest.name,
        description: analysisRequest.description,
        employeeCount: analysisRequest.employeeCount,
        location: analysisRequest.location,
        businessModel: analysisRequest.businessModel,
        targetMarket: analysisRequest.targetMarket,
        landType: analysisRequest.landType,
        landArea: analysisRequest.landArea,
        analysisData: JSON.stringify(analysis),
        generatedBy: req.user!.id,
        status: 'completed'
      }
    })

    res.json({
      success: true,
      data: {
        analysisId: savedAnalysis.id,
        analysis,
        generatedAt: savedAnalysis.createdAt
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

    console.error('Analysis generation error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to generate analysis'
    })
  }
})

// GET /api/analysis/:id - Get analysis by ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params

    const analysis = await prisma.startupAnalysis.findUnique({
      where: { id },
      include: {
        generatedByUser: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found'
      })
    }

    // Check if user has access to this analysis
    if (analysis.generatedBy !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      })
    }

    const analysisData = JSON.parse(analysis.analysisData)

    res.json({
      success: true,
      data: {
        id: analysis.id,
        startupName: analysis.startupName,
        description: analysis.description,
        employeeCount: analysis.employeeCount,
        location: analysis.location,
        businessModel: analysis.businessModel,
        targetMarket: analysis.targetMarket,
        landType: analysis.landType,
        landArea: analysis.landArea,
        analysis: analysisData,
        generatedBy: analysis.generatedByUser,
        generatedAt: analysis.createdAt,
        status: analysis.status
      }
    })
  } catch (error) {
    console.error('Error fetching analysis:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analysis'
    })
  }
})

// GET /api/analysis - Get user's analyses
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { page = '1', limit = '10' } = req.query
    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    const where = req.user!.role === 'admin' 
      ? {} 
      : { generatedBy: req.user!.id }

    const [analyses, total] = await Promise.all([
      prisma.startupAnalysis.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          generatedByUser: {
            select: {
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.startupAnalysis.count({ where })
    ])

    res.json({
      success: true,
      data: analyses.map((analysis: DbAnalysis) => ({
        id: analysis.id,
        startupName: analysis.startupName,
        location: analysis.location,
        employeeCount: analysis.employeeCount,
        status: analysis.status,
        generatedBy: analysis.generatedByUser,
        generatedAt: analysis.createdAt
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    })
  } catch (error) {
    console.error('Error fetching analyses:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analyses'
    })
  }
})

// POST /api/analysis/:id/pdf - Generate PDF report
router.post('/:id/pdf', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params

    const analysis = await prisma.startupAnalysis.findUnique({
      where: { id }
    })

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Analysis not found'
      })
    }

    // Check if user has access to this analysis
    if (analysis.generatedBy !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      })
    }

    const analysisData = JSON.parse(analysis.analysisData)

    // Create analysis request object for PDF generation
    const analysisRequest: StartupAnalysisRequest = {
      name: analysis.startupName,
      description: analysis.description,
      employeeCount: analysis.employeeCount,
      location: analysis.location,
      businessModel: analysis.businessModel ?? undefined,
      targetMarket: analysis.targetMarket ?? undefined,
      landType: analysis.landType ?? undefined,
      landArea: analysis.landArea ?? undefined
    }

    // Generate PDF
    const pdfBuffer = await pdfService.generateStartupReport(analysisRequest, analysisData)

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${analysis.startupName}-analysis-report.pdf"`)
    res.setHeader('Content-Length', pdfBuffer.length)

    res.send(pdfBuffer)
  } catch (error) {
    console.error('PDF generation error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to generate PDF report'
    })
  }
})

// POST /api/analysis/quick - Quick analysis without saving to database
router.post('/quick', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const validatedData = analysisRequestSchema.parse(req.body)

    const analysisRequest: StartupAnalysisRequest = {
      name: validatedData.name,
      description: validatedData.description,
      employeeCount: validatedData.employeeCount,
      location: validatedData.location,
      businessModel: validatedData.businessModel,
      targetMarket: validatedData.targetMarket,
      landType: validatedData.landType,
      landArea: validatedData.landArea
    }

    // Generate analysis using ADK
    const analysis = await adkService.generateStartupAnalysis(analysisRequest)

    res.json({
      success: true,
      data: {
        analysis,
        generatedAt: new Date()
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

    console.error('Quick analysis error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to generate quick analysis'
    })
  }
})

export default router
