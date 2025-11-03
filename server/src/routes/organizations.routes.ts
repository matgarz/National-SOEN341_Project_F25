import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken } from "../middleware/auth/jwtAuth.js";
import { authAdmin } from "../middleware/auth/roleAuth.js";
import { Request, Response } from "express";

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticateToken);
router.use(authAdmin);

// GET /api/admin/organizations - List all organizations (already exists)
router.get("/", async (req: Request, res) => {
  try {
    const orgs = await prisma.organization.findMany({
      include: {
        _count: {
          select: {
            event: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(orgs);
  } catch (error) {
    console.error("Error fetching organizations:", error);
    res.status(500).json({
      error: "Failed to fetch organizations",
      details: error instanceof Error ? error.message : error,
    });
  }
});

// GET /api/admin/organizations/:id - Get single organization details
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const orgId = parseInt(req.params.id);

    if (isNaN(orgId)) {
      return res.status(400).json({ error: "Invalid organization ID" });
    }

    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        _count: {
          select: {
            event: true,
          },
        },
      },
    });

    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    // Get count of organizers (users with ORGANIZER role who created events for this org)
    const organizerCount = await prisma.user.count({
      where: {
        role: "ORGANIZER",
        event: {
          some: {
            organizationId: orgId,
          },
        },
      },
    });

    res.json({
      ...organization,
      organizerCount,
    });
  } catch (error) {
    console.error("Error fetching organization details:", error);
    res.status(500).json({
      error: "Failed to fetch organization details",
      details: error instanceof Error ? error.message : error,
    });
  }
});

// GET /api/admin/organizations/:id/events - Get all events for an organization
router.get("/:id/events", async (req: Request, res: Response) => {
  try {
    const orgId = parseInt(req.params.id);

    if (isNaN(orgId)) {
      return res.status(400).json({ error: "Invalid organization ID" });
    }

    const events = await prisma.event.findMany({
      where: { organizationId: orgId },
      select: {
        id: true,
        title: true,
        date: true,
        status: true,
        category: true,
        location: true,
        createdAt: true,
        _count: {
          select: {
            ticket: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    res.json(events);
  } catch (error) {
    console.error("Error fetching organization events:", error);
    res.status(500).json({
      error: "Failed to fetch organization events",
      details: error instanceof Error ? error.message : error,
    });
  }
});

// POST /api/admin/organizations - Create new organization
router.post("/", async (req: Request, res) => {
  try {
    const { name, description, contactEmail, isActive } = req.body;

    // Validation
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: "Organization name is required" });
    }

    if (contactEmail && !contactEmail.includes("@")) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const organization = await prisma.organization.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        contactEmail: contactEmail?.trim() || null,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    res.status(201).json(organization);
  } catch (error) {
    console.error("Error creating organization:", error);
    res.status(500).json({
      error: "Failed to create organization",
      details: error instanceof Error ? error.message : error,
    });
  }
});

// PATCH /api/admin/organizations/:id - Update organization
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const orgId = parseInt(req.params.id);

    if (isNaN(orgId)) {
      return res.status(400).json({ error: "Invalid organization ID" });
    }

    const { name, description, contactEmail, isActive } = req.body;

    // Validation
    if (name !== undefined && name.trim().length === 0) {
      return res
        .status(400)
        .json({ error: "Organization name cannot be empty" });
    }

    if (contactEmail && !contactEmail.includes("@")) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Check if organization exists
    const existingOrg = await prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!existingOrg) {
      return res.status(404).json({ error: "Organization not found" });
    }

    const updatedOrg = await prisma.organization.update({
      where: { id: orgId },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && {
          description: description.trim() || null,
        }),
        ...(contactEmail !== undefined && {
          contactEmail: contactEmail.trim() || null,
        }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.json(updatedOrg);
  } catch (error) {
    console.error("Error updating organization:", error);
    res.status(500).json({
      error: "Failed to update organization",
      details: error instanceof Error ? error.message : error,
    });
  }
});

// DELETE /api/admin/organizations/:id - Delete organization
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const orgId = parseInt(req.params.id);

    if (isNaN(orgId)) {
      return res.status(400).json({ error: "Invalid organization ID" });
    }

    // Check if organization exists
    const existingOrg = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        _count: {
          select: {
            event: true,
          },
        },
      },
    });

    if (!existingOrg) {
      return res.status(404).json({ error: "Organization not found" });
    }

    if (existingOrg._count.event > 0) {
      return res.status(400).json({
        error: "Cannot delete organization with existing events",
        eventCount: existingOrg._count.event,
        suggestion: "Delete all events first or set organization to inactive",
      });
    } else {
      await prisma.organization.delete({
        where: { id: orgId },
      });
    }

    res.json({
      message: "Organization deleted successfully",
      deletedId: orgId,
    });
  } catch (error) {
    console.error("Error deleting organization:", error);
    res.status(500).json({
      error: "Failed to delete organization",
      details: error instanceof Error ? error.message : error,
    });
  }
});

export default router;
