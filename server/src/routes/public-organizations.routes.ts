import express from "express";
import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/organizations/public
router.get("/public", async (req: Request, res: Response) => {
  try {
    const organizations = await prisma.organization.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    res.json(organizations);
  } catch (error) {
    console.error("Error fetching public organizations:", error);
    res.status(500).json({
      error: "Failed to fetch organizations",
      details: error instanceof Error ? error.message : error,
    });
  }
});

export default router;
