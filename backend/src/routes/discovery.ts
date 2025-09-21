import express from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import axios from "axios";

const router: express.Router = express.Router();
const prisma = new PrismaClient();

// Define the schema for verified project data
const projectDataSchema = z.object({
  // Basic info
  name: z.string().min(1, "Name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  industry: z.string().min(1, "Industry is required"),

  // Online presence
  website: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
  twitterUrl: z.string().url().optional(),

  // Location and team
  location: z.string().min(1, "Location is required"),
  teamSize: z.number().int().positive("Team size must be at least 1"),
  stage: z.enum(["idea", "mvp", "early", "growth", "scale"]),
  tags: z.array(z.string()).optional().default([]),

  // Founder info
  founderName: z.string().min(1, "Founder name is required"),
  founderEmail: z.string().email("Invalid email address"),
  founderPhone: z.string().optional(),

  // Land details
  landArea: z.number().positive("Land area must be positive"),
  landOwnership: z.enum(["owned", "leased", "partnership"]),
  landType: z.string().min(1, "Land type is required"),

  // Business details
  businessModel: z.string().min(1, "Business model is required"),
  targetMarket: z.string().min(1, "Target market is required"),
  currentFunding: z.number().default(0),
  expectedRevenue: z.number().optional(),
  fundingRequired: z.number().optional(),
});

// Validation schemas
const discoverBusinessesSchema = z.object({
  location: z.string().min(1),
  radius: z.number().min(1).max(100).default(10), // km
  industry: z.string().optional(),
  limit: z.number().min(1).max(50).default(10),
});

const verifyDiscoverySchema = z.object({
  status: z.enum(["verified", "rejected"]),
  projectData: projectDataSchema.optional(),
});

// GET /api/discovery - Get all discoveries with filtering
router.get("/", async (req, res) => {
  try {
    const {
      page = "1",
      limit = "20",
      location,
      industry,
      status,
      minConfidence,
      sortBy = "discoveredAt",
      sortOrder = "desc",
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

    if (location) {
      where.location = { contains: location as string, mode: "insensitive" };
    }

    if (industry) {
      where.industry = industry;
    }

    if (status) {
      where.status = status;
    }

    if (minConfidence) {
      where.confidence = { gte: parseFloat(minConfidence as string) };
    }

    // Build orderBy clause
    const orderBy: any = {};
    orderBy[sortBy as string] = sortOrder;

    const [discoveries, total] = await Promise.all([
      prisma.geoSocialDiscovery.findMany({
        where,
        skip,
        take: limitNum,
        orderBy,
      }),
      prisma.geoSocialDiscovery.count({ where }),
    ]);

    res.json({
      success: true,
      data: discoveries,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Error fetching discoveries:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch discoveries",
    });
  }
});

// GET /api/discovery/:id - Get discovery by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const discovery = await prisma.geoSocialDiscovery.findUnique({
      where: { id },
    });

    if (!discovery) {
      return res.status(404).json({
        success: false,
        error: "Discovery not found",
      });
    }

    res.json({
      success: true,
      data: discovery,
    });
  } catch (error) {
    console.error("Error fetching discovery:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch discovery",
    });
  }
});

// POST /api/discovery/discover - Discover new businesses in a location
router.post("/discover", async (req, res) => {
  try {
    const { location, radius, industry, limit } =
      discoverBusinessesSchema.parse(req.body);

    // This is a simplified implementation
    // In a real application, you would integrate with:
    // - Google Places API for business discovery
    // - Twitter API for location-based tweets
    // - LinkedIn API for business profiles
    // - Other social media APIs

    const discoveries = await discoverBusinessesInLocation(
      location,
      radius,
      industry,
      limit
    );

    // Save discoveries to database
    const savedDiscoveries = [];
    for (const discovery of discoveries) {
      const saved = await prisma.geoSocialDiscovery.create({
        data: discovery,
      });
      savedDiscoveries.push(saved);
    }

    res.json({
      success: true,
      data: savedDiscoveries,
      message: `Discovered ${savedDiscoveries.length} potential businesses`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.errors,
      });
    }

    console.error("Error discovering businesses:", error);
    res.status(500).json({
      success: false,
      error: "Failed to discover businesses",
    });
  }
});

// PUT /api/discovery/:id/verify - Verify or reject a discovery
router.put("/:id/verify", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, projectData } = verifyDiscoverySchema.parse(req.body);

    const discovery = await prisma.geoSocialDiscovery.findUnique({
      where: { id },
    });

    if (!discovery) {
      return res.status(404).json({
        success: false,
        error: "Discovery not found",
      });
    }

    if (status === "verified" && projectData) {
      // Create a new project from the verified discovery
      // Create a startup record with all required fields
      const project = await prisma.agriTechStartup.create({
        data: {
          // Basic info
          name: projectData.name,
          description: projectData.description,
          industry: projectData.industry,

          // Online presence
          website: projectData.website,
          githubUrl: projectData.githubUrl,
          twitterUrl: projectData.twitterUrl,

          // Land details
          landLocation: projectData.location, // map verified location to landLocation
          landArea: projectData.landArea,
          landOwnership: projectData.landOwnership,
          landType: projectData.landType,

          // Team & Stage
          teamSize: projectData.teamSize,
          stage: projectData.stage,
          tags: projectData.tags ?? [],

          // Founder details
          founderName: projectData.founderName,
          founderEmail: projectData.founderEmail,
          founderPhone: projectData.founderPhone,

          // Business details
          businessModel: projectData.businessModel,
          targetMarket: projectData.targetMarket,
          currentFunding: projectData.currentFunding,
          expectedRevenue: projectData.expectedRevenue,
          fundingRequired: projectData.fundingRequired,

          // Status
          isVerified: false,
        },
      });

      // Update discovery status
      await prisma.geoSocialDiscovery.update({
        where: { id },
        data: { status: "verified" },
      });

      res.json({
        success: true,
        data: {
          discovery: { ...discovery, status: "verified" },
          project,
        },
        message: "Discovery verified and project created",
      });
    } else {
      // Reject the discovery
      await prisma.geoSocialDiscovery.update({
        where: { id },
        data: { status: "rejected" },
      });

      res.json({
        success: true,
        data: { ...discovery, status: "rejected" },
        message: "Discovery rejected",
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.errors,
      });
    }

    console.error("Error verifying discovery:", error);
    res.status(500).json({
      success: false,
      error: "Failed to verify discovery",
    });
  }
});

// DELETE /api/discovery/:id - Delete a discovery
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.geoSocialDiscovery.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Discovery deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting discovery:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete discovery",
    });
  }
});

// POST /api/discovery/scan - Start automated scanning for a location
router.post("/scan", async (req, res) => {
  try {
    const { location, frequency = "daily" } = req.body;

    if (!location) {
      return res.status(400).json({
        success: false,
        error: "Location is required",
      });
    }

    // In a real application, this would:
    // 1. Schedule a recurring job to scan the location
    // 2. Use services like Google Places API, Twitter API, etc.
    // 3. Apply AI/ML models to identify business-related content
    // 4. Store results in the database

    // For now, we'll simulate the discovery process
    const discoveries = await discoverBusinessesInLocation(
      location,
      10,
      undefined,
      5
    );

    const savedDiscoveries = [];
    for (const discovery of discoveries) {
      const saved = await prisma.geoSocialDiscovery.create({
        data: discovery,
      });
      savedDiscoveries.push(saved);
    }

    res.json({
      success: true,
      data: {
        location,
        frequency,
        discoveries: savedDiscoveries,
      },
      message: `Started scanning ${location}. Found ${savedDiscoveries.length} potential businesses.`,
    });
  } catch (error) {
    console.error("Error starting scan:", error);
    res.status(500).json({
      success: false,
      error: "Failed to start scanning",
    });
  }
});

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
      socialMediaUrl: `https://twitter.com/techstart${Math.floor(
        Math.random() * 1000
      )}`,
      description: "AI-powered software development platform for startups",
      industry: industry || "Developer Tools",
      confidence: 0.85 + Math.random() * 0.15,
      status: "pending" as const,
    },
    {
      location,
      businessName: `GreenTech ${Math.floor(Math.random() * 1000)}`,
      socialMediaUrl: `https://linkedin.com/company/greentech${Math.floor(
        Math.random() * 1000
      )}`,
      description:
        "Sustainable technology solutions for environmental monitoring",
      industry: industry || "Climate Tech",
      confidence: 0.75 + Math.random() * 0.2,
      status: "pending" as const,
    },
    {
      location,
      businessName: `HealthSync ${Math.floor(Math.random() * 1000)}`,
      socialMediaUrl: `https://facebook.com/healthsync${Math.floor(
        Math.random() * 1000
      )}`,
      description: "Digital health platform for patient data management",
      industry: industry || "HealthTech",
      confidence: 0.8 + Math.random() * 0.15,
      status: "pending" as const,
    },
  ];

  // Return a random subset
  const shuffled = mockDiscoveries.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(limit, shuffled.length));
}

export default router;
