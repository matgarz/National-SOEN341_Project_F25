//All current Imports required
import { Router } from "express";
import type { Request, Response } from "express";
import { PrismaClient, type Prisma } from "@prisma/client";
import { createEventValidation } from "../middleware/validators/event.validator.js";
import { handleValidationErrors } from "../middleware/validationHandler.js";
import QRCode from "qrcode";
import { randomUUID } from "crypto";

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

// GET /api/events/organizer/:organizerId/analytics - Get Analytics for all organizer events
router.get(
  "/organizer/:organizerId/analytics",
  async (req: Request, res: Response) => {
    try {
      const organizerId = parseInt(req.params.organizerId);
      if (isNaN(organizerId)) {
        return res.status(400).json({ error: "Invalid organizer ID" });
      }

      const events = await prisma.event.findMany({
        where: { creatorId: organizerId },
        include: {
          _count: { select: { ticket: true } },
          ticket: { select: { checkedIn: true } },
        },
      });

      const analytics = events.map((ev) => {
        const ticketsIssued = ev._count.ticket;
        const attended = ev.ticket.filter((t) => t.checkedIn).length;
        const attendanceRate =
          ticketsIssued > 0 ? (attended / ticketsIssued) * 100 : 0;
        const remainingCapacity = ev.capacity - ticketsIssued;

        return {
          eventId: ev.id,
          title: ev.title,
          date: ev.date,
          ticketsIssued,
          attended,
          attendanceRate: attendanceRate.toFixed(1),
          remainingCapacity: remainingCapacity >= 0 ? remainingCapacity : 0,
        };
      });

      res.json(analytics);
    } catch (error) {
      console.error("Error fetching organizer analytics:", error);
      res.status(500).json({
        error: "Failed to fetch organizer analytics",
        details: error instanceof Error ? error.message : error,
      });
    }
  },
);

// GET /api/events/:id/details - Get analytics of a particular event with attendee list
router.get("/:id/details", async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.id);
    if (isNaN(eventId))
      return res.status(400).json({ error: "Invalid event ID" });

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organization: true,
        user: { select: { id: true, name: true, email: true } },
        ticket: {
          select: {
            id: true,
            checkedIn: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!event) return res.status(404).json({ error: "Event not found" });

    // Compute attendance stats
    const ticketsIssued = event.ticket.length;
    const attended = event.ticket.filter((t) => t.checkedIn).length;
    const attendanceRate =
      ticketsIssued > 0 ? ((attended / ticketsIssued) * 100).toFixed(1) : "0";

    res.json({
      event: {
        id: event.id,
        title: event.title,
        date: event.date,
        capacity: event.capacity,
        ticketsIssued,
        attended,
        attendanceRate,
      },
      attendees: event.ticket.map((t) => ({
        id: t.id,
        name: t.user.name,
        email: t.user.email,
        checkedIn: t.checkedIn,
      })),
    });
  } catch (err) {
    console.error("Error fetching event details:", err);
    res.status(500).json({
      error: "Failed to fetch event details",
      details: err instanceof Error ? err.message : err,
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

// GET /api/events/saved - Get all saved events for the authenticated user
router.get("/saved/:userId", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const savedEvents = await prisma.savedevent.findMany({
      where: { userId },
      include: {
        event: {
          include: {
            organization: { select: { id: true, name: true } },
            user: { select: { id: true, name: true, email: true } },
            _count: { select: { ticket: true } },
          },
        },
      },
    });

    const events = savedEvents.map((saved) => saved.event);
    res.json(events);
  } catch (error) {
    console.error("Error fetching saved events:", error);
    res.status(500).json({
      error: "Failed to fetch saved events",
      details: error instanceof Error ? error.message : error,
    });
  }
});

// POST /api/events/:id/save - Save an event for the authenticated user
router.post("/:id/save", async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.id);
    const { userId } = req.body;

    if (isNaN(eventId) || !userId) {
      return res.status(400).json({ error: "Invalid event ID or user ID" });
    }

    // Check if event exists
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Check if already saved
    const existing = await prisma.savedevent.findUnique({
      where: {
        userId_eventId: {
          userId: parseInt(userId),
          eventId,
        },
      },
    });

    if (existing) {
      return res.status(200).json({ message: "Event already saved" });
    }

    // Create saved event
    const savedEvent = await prisma.savedevent.create({
      data: {
        userId: parseInt(userId),
        eventId,
      },
    });

    res.status(201).json({
      message: "Event saved successfully",
      savedEvent,
    });
  } catch (error) {
    console.error("Error saving event:", error);
    res.status(500).json({
      error: "Failed to save event",
      details: error instanceof Error ? error.message : error,
    });
  }
});

// DELETE /api/events/:id/save - Remove a saved event
router.delete("/:id/save", async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.id);
    const { userId } = req.body;

    if (isNaN(eventId) || !userId) {
      return res.status(400).json({ error: "Invalid event ID or user ID" });
    }

    // Delete saved event
    await prisma.savedevent.delete({
      where: {
        userId_eventId: {
          userId: parseInt(userId),
          eventId,
        },
      },
    });

    res.json({ message: "Event unsaved successfully" });
  } catch (error) {
    console.error("Error unsaving event:", error);
    if (
      error instanceof Error &&
      error.message.includes("Record to delete does not exist")
    ) {
      return res.status(404).json({ error: "Saved event not found" });
    }
    res.status(500).json({
      error: "Failed to unsave event",
      details: error instanceof Error ? error.message : error,
    });
  }
});

// POST /api/events/:id/ticket - Claim a ticket for an event
router.post("/:id/ticket", async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.id);
    const { userId } = req.body;

    if (isNaN(eventId) || !userId) {
      return res.status(400).json({ error: "Invalid event ID or user ID" });
    }

    // Check if event exists and is approved
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: { select: { ticket: true } },
      },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (event.status !== "APPROVED") {
      return res
        .status(400)
        .json({ error: "Event is not approved for ticket sales" });
    }

    // Check if event has available capacity
    if (event._count.ticket >= event.capacity) {
      return res.status(400).json({ error: "Event is sold out" });
    }

    // Check if user already has a ticket for this event
    const existingTicket = await prisma.ticket.findUnique({
      where: {
        userId_eventId: {
          userId: parseInt(userId),
          eventId,
        },
      },
    });

    if (existingTicket) {
      return res.status(200).json({
        message: "You already have a ticket for this event",
        ticket: existingTicket,
      });
    }

    // Generate QR code data
    const ticketId = randomUUID();
    const qrData = JSON.stringify({
      ticketId,
      eventId,
      userId: parseInt(userId),
      eventTitle: event.title,
      date: event.date.toISOString(),
      location: event.location,
    });

    // Create the ticket
    const ticket = await prisma.ticket.create({
      data: {
        qrCode: ticketId, // Store the unique ID as QR code identifier
        userId: parseInt(userId),
        eventId,
        claimed: true,
        checkedIn: false,
        paymentStatus: event.ticketType === "FREE" ? "FREE" : "PENDING",
        paymentAmount: event.ticketPrice,
        updatedAt: new Date(),
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            date: true,
            location: true,
            ticketType: true,
            ticketPrice: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Ticket claimed successfully",
      ticket,
      qrData, // Include QR data for frontend to generate QR code
    });
  } catch (error) {
    console.error("Error claiming ticket:", error);
    res.status(500).json({
      error: "Failed to claim ticket",
      details: error instanceof Error ? error.message : error,
    });
  }
});

// GET /api/events/tickets/:userId - Get all tickets for a user
router.get("/tickets/:userId", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const tickets = await prisma.ticket.findMany({
      where: { userId },
      include: {
        event: {
          include: {
            organization: { select: { id: true, name: true } },
            user: { select: { id: true, name: true, email: true } },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(tickets);
  } catch (error) {
    console.error("Error fetching user tickets:", error);
    res.status(500).json({
      error: "Failed to fetch tickets",
      details: error instanceof Error ? error.message : error,
    });
  }
  // POST /api/events/validate-ticket
  router.post("/validate-ticket", async (req: Request, res: Response) => {
    try {
      const { qrCode } = req.body;

      if (!qrCode || typeof qrCode !== "string") {
        return res.status(400).json({ error: "QR code is required" });
      }

      // Find ticket with that QR code
      const ticket = await prisma.ticket.findUnique({
        where: { qrCode },
        include: {
          user: { select: { id: true, name: true, email: true } },
          event: { select: { id: true, title: true, date: true } },
        },
      });

      if (!ticket) {
        return res.status(404).json({ error: "Invalid QR code" });
      }

      // Check if already checked in
      if (ticket.checkedIn) {
        return res.status(400).json({
          error: "Ticket already validated",
          checkedInAt: ticket.checkedInAt,
          user: ticket.user,
          event: ticket.event,
        });
      }

      // Update ticket as checked-in
      const updatedTicket = await prisma.ticket.update({
        where: { id: ticket.id },
        data: { checkedIn: true, checkedInAt: new Date() },
      });

      res.json({
        message: "Ticket successfully validated",
        ticket: {
          id: updatedTicket.id,
          user: ticket.user,
          event: ticket.event,
          checkedInAt: updatedTicket.checkedInAt,
        },
      });
    } catch (error) {
      console.error("Error validating ticket:", error);
      res.status(500).json({
        error: "Failed to validate ticket",
        details: error instanceof Error ? error.message : error,
      });
    }
  });
});

export default router;
