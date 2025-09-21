import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import adkService from '../services/adkService';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schema for market research request
const marketResearchSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  employeeCount: z.number().min(1, 'Employee count must be at least 1'),
  location: z.string().min(1, 'Location is required'),
  businessModel: z.string().optional(),
  targetMarket: z.string().optional(),
  landType: z.string().optional(),
  landArea: z.number().positive().optional(),
});

// POST /api/market-research/analyze - Generate market research analysis
router.post('/analyze', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const validatedData = marketResearchSchema.parse(req.body);

    // Create analysis request
    const analysisRequest = {
      name: validatedData.name,
      description: validatedData.description,
      employeeCount: validatedData.employeeCount,
      location: validatedData.location,
      businessModel: validatedData.businessModel,
      targetMarket: validatedData.targetMarket,
      landType: validatedData.landType,
      landArea: validatedData.landArea,
    };

    // Generate analysis using ADK
    const analysis = await adkService.generateStartupAnalysis(analysisRequest);

    // Save analysis to database
    const savedAnalysis = await prisma.startupAnalysis.create({
      data: {
        startupName: analysisRequest.name,
        description: analysisRequest.description,
        employeeCount: analysisRequest.employeeCount,
        location: analysisRequest.location,
        businessModel: analysisRequest.businessModel ?? null,
        targetMarket: analysisRequest.targetMarket ?? null,
        landType: analysisRequest.landType ?? null,
        landArea: analysisRequest.landArea ?? null,
        analysisData: JSON.stringify(analysis),
        generatedBy: req.user!.id,
        status: 'completed'
      }
    });

    res.json({
      success: true,
      data: {
        id: savedAnalysis.id,
        analysis
      }
    });
  } catch (error) {
    console.error('Market research analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate market research analysis'
    });
  }
});

export default router;