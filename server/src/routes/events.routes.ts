//All current Imports required
import { Router } from "express";
import type { Request, Response } from "express";
import { PrismaClient, type Prisma } from "@prisma/client";
import { createEventValidation } from "../middleware/validators/event.validator.js";
import { handleValidationErrors } from "../middleware/validationHandler.js";

const router = Router();
const prisma = new PrismaClient();

// GET /api/events - Get all events (with optional upcoming filter)
router.get("/", async (req: Request, res: Response) => {
  try {
    const upcomingOnly =
      String(req.query.upcoming ?? "").toLowerCase() === "true";

    const where: Prisma.eventWhereInput = {
      status: "APPROVED",
      ...(upcomingOnly ? { date: { gte: new Date() } } : {}),
    };

    const events = await prisma.event.findMany({
      where,
      include: {
        organization: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true } },
        _count: { select: { ticket: true } },
      },
      orderBy: { date: "asc" },
    });

    res.json(events);
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({
      error: "Failed to fetch events 1",
      details: err instanceof Error ? err.message : err,
    });
  }
});

// GET /api/events/search?keyword=yourKeyword
router.get("/search", async (req: Request, res: Response) => {
  try {
    const keyword = req.query.keyword as string;

    if (!keyword) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const events = await prisma.event.findMany({
      where: {
        status: "APPROVED",
        date: { gte: new Date() },
        OR: [
          // Searches title and description
          { title: { contains: keyword } },
          { description: { contains: keyword } },
        ],
      },

      include: {
        organization: true,
        user: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { ticket: true },
        },
      },
      orderBy: { date: "asc" },
    });
    res.json(events);
  } catch (error) {
    console.error("Error searching events: ", error);
    res.status(500).json({
      error: "Failed to search events",
      details: error instanceof Error ? error.message : error,
    });
  }
});

// GET /api/events/upcoming = Get all upcoming events

router.get("/upcoming", async (req: Request, res: Response) => {
  try {
    const events = await prisma.event.findMany({
      where: {
        status: "APPROVED",
        date: { gte: new Date() }, // Only upcoming events are sorted
      },
      include: {
        organization: true,
        user: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { ticket: true },
        },
      },
      orderBy: { date: "asc" },
    });

    res.json(events);
  } catch (error) {
    // catching errors
    console.error("Error fetching events:", error);
    res.status(500).json({
      error: "Failed to fetch events 2",
      details: error instanceof Error ? error.message : error,
    });
  }
});

// GET /api/events/:id - Get single event by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        organization: true,
        user: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { ticket: true },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({
      error: "Failed to fetch event 3",
      details: error instanceof Error ? error.message : error,
    });
  }
});
//POST /api/events (Create new Event)
router.post(
  "/",
  createEventValidation,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const {
        title,
        description,
        date,
        location,
        capacity,
        ticketType,
        ticketPrice,
        category,
        imageUrl,
        organizationId,
        status,
        creatorId,
      } = req.body;
      if (!creatorId) {
        return res.status(400).json({ error: "Creator ID is required" });
      }
      const organization = await prisma.organization.findUnique({
        where: { id: parseInt(organizationId) },
      });
      if (!organization) {
        return res.status(404).json({ error: "Organization not found" });
      }
      if (!organization.isActive) {
        return res.status(400).json({ error: "Organization is not active" });
      }
      const creator = await prisma.user.findUnique({
        where: { id: parseInt(creatorId) },
      });
      if (!creator) {
        return res.status(404).json({ error: "Creator not found" });
      }

      // Create the new event
      const newEvent = await prisma.event.create({
        data: {
          title: title.trim(),
          description: description.trim(),
          date: new Date(date),
          location: location.trim(),
          capacity: parseInt(capacity),
          ticketType: ticketType || "FREE",
          ticketPrice: ticketPrice ? parseFloat(ticketPrice) : null,
          category: category?.trim() || null,
          imageUrl: imageUrl?.trim() || null,
          status: status,
          organizationId: parseInt(organizationId),
          creatorId: parseInt(creatorId),
          updatedAt: new Date(),
        },
        include: {
          organization: {
            select: { id: true, name: true, description: true },
          },
          user: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: { ticket: true },
          },
        },
      });
      res.status(201).json({
        message: "Event created successfully",
        event: newEvent,
      });
    } catch (error) {
      console.error("Error creating event:", error);
      if (error instanceof Error) {
        if (error.message.includes("Foreign key constraint")) {
          return res
            .status(400)
            .json({ error: "Invalid reference ID provided" });
        }
      }
      res.status(500).json({ error: "Failed to create event" });
    }
  },
);

export default router;
