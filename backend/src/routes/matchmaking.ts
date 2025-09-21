import express from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const router: express.Router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const createMatchSchema = z.object({
  investorId: z.string(),
  startupId: z.string(),
  score: z.number().min(0).max(100),
  reasons: z.array(z.string()),
  status: z
    .enum(["pending", "accepted", "rejected", "contacted"])
    .default("pending"),
});

const updateMatchSchema = z.object({
  status: z.enum(["pending", "accepted", "rejected", "contacted"]),
  reasons: z.array(z.string()).optional(),
});

// GET /api/matchmaking - Get all matches with filtering
router.get("/", async (req, res) => {
  try {
    const {
      page = "1",
      limit = "20",
      investorId,
      startupId,
      status,
      minScore,
      maxScore,
      sortBy = "score",
      sortOrder = "desc",
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

    if (investorId) {
      where.investorId = investorId;
    }

    if (startupId) {
      where.startupId = startupId;
    }

    if (status) {
      where.status = status;
    }

    if (minScore || maxScore) {
      where.score = {};
      if (minScore) where.score.gte = parseInt(minScore as string);
      if (maxScore) where.score.lte = parseInt(maxScore as string);
    }

    // Build orderBy clause
    const orderBy: any = {};
    orderBy[sortBy as string] = sortOrder;

    const [matches, total] = await Promise.all([
      prisma.match.findMany({
        where,
        skip,
        take: limitNum,
        orderBy,
        include: {
          investor: true,
          startup: {
            include: {
              metrics: true,
              techScoreData: true,
              socialScoreData: true,
            },
          },
        },
      }),
      prisma.match.count({ where }),
    ]);

    res.json({
      success: true,
      data: matches,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Error fetching matches:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch matches",
    });
  }
});

// GET /api/matchmaking/:id - Get match by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        investor: true,
        startup: {
          include: {
            metrics: true,
            techScoreData: true,
            socialScoreData: true,
          },
        },
      },
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        error: "Match not found",
      });
    }

    res.json({
      success: true,
      data: match,
    });
  } catch (error) {
    console.error("Error fetching match:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch match",
    });
  }
});

// POST /api/matchmaking - Create new match
router.post("/", async (req, res) => {
  try {
    const validatedData = createMatchSchema.parse(req.body);

    // Check if match already exists
    const existingMatch = await prisma.match.findUnique({
      where: {
        investorId_startupId: {
          investorId: validatedData.investorId,
          startupId: validatedData.startupId,
        },
      },
    });

    if (existingMatch) {
      return res.status(409).json({
        success: false,
        error: "Match already exists",
      });
    }

    const match = await prisma.match.create({
      data: validatedData,
      include: {
        investor: true,
        startup: {
          include: {
            metrics: true,
            techScoreData: true,
            socialScoreData: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: match,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.errors,
      });
    }

    console.error("Error creating match:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create match",
    });
  }
});

// PUT /api/matchmaking/:id - Update match
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateMatchSchema.parse(req.body);

    const match = await prisma.match.update({
      where: { id },
      data: validatedData,
      include: {
        investor: true,
        startup: {
          include: {
            metrics: true,
            techScoreData: true,
            socialScoreData: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: match,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.errors,
      });
    }

    console.error("Error updating match:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update match",
    });
  }
});

// DELETE /api/matchmaking/:id - Delete match
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.match.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Match deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting match:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete match",
    });
  }
});

// POST /api/matchmaking/generate - Generate matches for an investor
router.post("/generate", async (req, res) => {
  try {
    const { investorId, limit = 10 } = req.body;

    if (!investorId) {
      return res.status(400).json({
        success: false,
        error: "investorId is required",
      });
    }

    // Get investor preferences
    const investor = await prisma.investor.findUnique({
      where: { id: investorId },
    });

    if (!investor) {
      return res.status(404).json({
        success: false,
        error: "Investor not found",
      });
    }

    // Find matching startups
    const matchingStartups = await prisma.agriTechStartup.findMany({
      where: {
        AND: [
          { landType: { in: investor.preferredIndustries } },
          { stage: { in: investor.preferredStages } },
          { techScore: { gte: investor.techScoreMin } },
          { socialScore: { gte: investor.socialScoreMin } },
          { teamSize: { gte: investor.teamSizeMin } },
          { id: { notIn: investor.portfolio } },
          {
            matches: {
              none: { investorId: investorId },
            },
          },
        ],
      },
      include: {
        metrics: true,
        techScoreData: true,
        socialScoreData: true,
      },
      take: parseInt(limit),
    });

    // Calculate match scores and create matches
    const matches = [];
    for (const startup of matchingStartups) {
      const score = calculateMatchScore(investor, startup);
      const reasons = generateMatchReasons(investor, startup);

      const match = await prisma.match.create({
        data: {
          investorId,
          startupId: startup.id,
          score,
          reasons,
          status: "pending",
        },
        include: {
          investor: true,
          startup: {
            include: {
              metrics: true,
              techScoreData: true,
              socialScoreData: true,
            },
          },
        },
      });

      matches.push(match);
    }

    res.json({
      success: true,
      data: matches,
      message: `Generated ${matches.length} new matches`,
    });
  } catch (error) {
    console.error("Error generating matches:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate matches",
    });
  }
});

// Helper function to calculate match score
function calculateMatchScore(investor: any, startup: any): number {
  let score = 0;

  // Industry match (30% weight)
  if (investor.preferredIndustries.includes(startup.landType)) {
    score += 30;
  }

  // Stage match (25% weight)
  if (investor.preferredStages.includes(startup.stage)) {
    score += 25;
  }

  // Tech score (20% weight)
  const techScoreRatio = startup.techScore / 100;
  score += techScoreRatio * 20;

  // Social score (15% weight)
  const socialScoreRatio = startup.socialScore / 100;
  score += socialScoreRatio * 15;

  // Team size (5% weight)
  if (startup.teamSize >= investor.teamSizeMin) {
    score += 5;
  }

  // Funding range (5% weight)
  if (
    startup.fundingRequired &&
    startup.fundingRequired >= investor.investmentRangeMin &&
    startup.fundingRequired <= investor.investmentRangeMax
  ) {
    score += 5;
  }

  return Math.round(score);
}

// Helper function to generate match reasons
function generateMatchReasons(investor: any, startup: any): string[] {
  const reasons: string[] = [];

  if (investor.preferredIndustries.includes(startup.landType)) {
    reasons.push(`Perfect industry alignment (${startup.landType})`);
  }

  if (investor.preferredStages.includes(startup.stage)) {
    reasons.push(`Stage (${startup.stage}) matches your investment focus`);
  }

  if (startup.techScore >= investor.techScoreMin) {
    reasons.push(
      `Strong tech score (${startup.techScore}/100) meets your minimum (${investor.techScoreMin}+)`
    );
  }

  if (startup.socialScore >= investor.socialScoreMin) {
    reasons.push(
      `Good social score (${startup.socialScore}/100) meets your minimum (${investor.socialScoreMin}+)`
    );
  }

  if (startup.teamSize >= investor.teamSizeMin) {
    reasons.push(
      `Team size (${startup.teamSize}) exceeds your preference (${investor.teamSizeMin}+)`
    );
  }

  const foundedYear = new Date(startup.createdAt).getFullYear();
  if (foundedYear >= investor.foundedYearMin) {
    reasons.push(
      `Founded in ${foundedYear}, meets your minimum (${investor.foundedYearMin}+)`
    );
  }

  return reasons;
}

export default router;
