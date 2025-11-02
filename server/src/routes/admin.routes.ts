import { Router } from "express";
import { Request, Response } from "express";
import { PrismaClient, user_role, event_status } from "@prisma/client";
import { authenticateToken } from "../middleware/auth/jwtAuth.js";
import { authAdmin } from "../middleware/auth/roleAuth.js";
const router = Router();
const prisma = new PrismaClient();
router.use(authenticateToken, authAdmin);
// GET /api/admin/users - Get all users with optional filtering
router.get("/users", async (req: Request, res: Response) => {
  try {
    const { role, search } = req.query;

    const users = await prisma.user.findMany({
      where: {
        ...(role && { role: role as user_role }),
        ...(search && {
          OR: [
            { name: { contains: search as string } },
            { email: { contains: search as string } },
            { studentId: { contains: search as string } },
          ],
        }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        studentId: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { event: true, ticket: true, review: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      error: "Failed to fetch users",
      details: error instanceof Error ? error.message : error,
    });
  }
});

// GET /api/admin/users/pending-organizers
router.get("/users/pending-organizers", async (req: Request, res: Response) => {
  try {
    const pendingOrganizers = await prisma.user.findMany({
      where: {
        role: "ORGANIZER",
        accountStatus: "PENDING",
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            event: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    res.json(pendingOrganizers);
  } catch (error) {
    console.error("Error fetching pending organizers:", error);
    res.status(500).json({
      error: "Failed to fetch pending organizers",
      details: error instanceof Error ? error.message : error,
    });
  }
});

// GET /api/admin/users/:id - Get single user with full details
router.get("/users/:id", async (req: Request, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            date: true,
            status: true,
            location: true,
          },
          orderBy: { date: "desc" },
        },
        ticket: {
          select: {
            id: true,
            event: {
              select: { title: true, date: true },
            },
            claimed: true,
            checkedIn: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
        review: {
          select: {
            id: true,
            rating: true,
            comment: true,
            event: {
              select: { title: true },
            },
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      error: "Failed to fetch user",
      details: error instanceof Error ? error.message : error,
    });
  }
});

// PATCH /api/admin/users/:id/approve
router.patch("/users/:id/approve", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.role !== "ORGANIZER") {
      return res.status(400).json({ error: "User is not an organizer" });
    }
    if (user.accountStatus !== "PENDING") {
      return res.status(400).json({
        error: "User account is not pending approval",
        currentStatus: user.accountStatus,
      });
    }
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        accountStatus: "APPROVED",
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        accountStatus: true,
        organizationId: true,
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    res.json({
      message: "Organizer account approved successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error approving organizer:", error);
    res.status(500).json({
      error: "Failed to approve organizer",
      details: error instanceof Error ? error.message : error,
    });
  }
});

// PATCH /api/admin/users/:id/reject
router.patch("/users/:id/reject", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.role !== "ORGANIZER") {
      return res.status(400).json({ error: "User is not an organizer" });
    }

    if (user.accountStatus !== "PENDING") {
      return res.status(400).json({
        error: "User account is not pending approval",
        currentStatus: user.accountStatus,
      });
    }
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        accountStatus: "REJECTED",
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        accountStatus: true,
      },
    });

    res.json({
      message: "Organizer account rejected",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error rejecting organizer:", error);
    res.status(500).json({
      error: "Failed to reject organizer",
      details: error instanceof Error ? error.message : error,
    });
  }
});

// GET /api/admin/organizations - List all organizations
router.get("/organizations", async (req, res) => {
  try {
    const orgs = await prisma.organization.findMany({
      include: {
        _count: { select: { event: true } },
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

// POST /api/admin/organizations - Create organization
router.post("/organizations", async (req, res) => {
  const { name, description, contactEmail } = req.body;
  const org = await prisma.organization.create({
    data: { name, description, contactEmail, isActive: true },
  });
  res.json(org);
});

// PATCH /api/admin/organizations/:id - Update organization
router.patch("/organizations/:id", async (req, res) => {
  const { name, description, contactEmail, isActive } = req.body;
  const org = await prisma.organization.update({
    where: { id: parseInt(req.params.id) },
    data: { name, description, contactEmail, isActive },
  });
  res.json(org);
});

// DELETE /api/admin/organizations/:id - Delete organization
router.delete("/organizations/:id", async (req, res) => {
  await prisma.organization.delete({
    where: { id: parseInt(req.params.id) },
  });
  res.json({ message: "Organization deleted" });
});

// PATCH /api/admin/users/:id/role - Update user role
router.patch("/users/:id/role", async (req: Request, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { role } = req.body;
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    if (!Object.values(user_role).includes(role)) {
      return res.status(400).json({
        error: "Invalid role. Must be one of: STUDENT, ORGANIZER, ADMIN",
      });
    }
    if (userId === req.user!.id && role !== "ADMIN") {
      return res.status(400).json({
        error: "Cannot change your own admin role",
      });
    }
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role, updatedAt: new Date() },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        updatedAt: true,
      },
    });
    res.json({
      message: "User role updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({
      error: "Failed to update user role",
      details: error instanceof Error ? error.message : error,
    });
  }
});
// DELETE /api/admin/users/:id - Delete user
router.delete("/users/:id", async (req: Request, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    if (userId === req.user!.id) {
      return res.status(400).json({
        error: "Cannot delete your own account",
      });
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    await prisma.user.delete({
      where: { id: userId },
    });
    res.json({
      message: "User deleted successfully",
      deletedUser: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      error: "Failed to delete user",
      details: error instanceof Error ? error.message : error,
    });
  }
});

// GET /api/admin/events - Get all events (including PENDING/REJECTED)
router.get("/events", async (req: Request, res) => {
  try {
    const { status, organizationId, category } = req.query;

    const events = await prisma.event.findMany({
      where: {
        ...(status && { status: status as event_status }),
        ...(organizationId && {
          organizationId: parseInt(organizationId as string),
        }),
        ...(category && { category: category as string }),
      },
      include: {
        organization: {
          select: { id: true, name: true, isActive: true },
        },
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
        _count: {
          select: {
            ticket: true,
            review: true,
            savedevent: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({
      error: "Failed to fetch events",
      details: error instanceof Error ? error.message : error,
    });
  }
});

// PATCH /api/admin/events/:id/status - Update event status
router.patch("/events/:id/status", async (req: Request, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const { status } = req.body;
    if (isNaN(eventId)) {
      return res.status(400).json({ error: "Invalid event ID" });
    }
    const validStatuses = Object.values(event_status);
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: { status, updatedAt: new Date() },
      include: {
        organization: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
    res.json({
      message: "Event status updated successfully",
      event: updatedEvent,
    });
  } catch (error) {
    console.error("Error updating event status:", error);
    res.status(500).json({
      error: "Failed to update event status",
      details: error instanceof Error ? error.message : error,
    });
  }
});

// DELETE /api/admin/events/:id - Delete event
router.delete("/events/:id", async (req: Request, res) => {
  try {
    const eventId = parseInt(req.params.id);
    if (isNaN(eventId)) {
      return res.status(400).json({ error: "Invalid event ID" });
    }
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, title: true },
    });
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    await prisma.event.delete({
      where: { id: eventId },
    });
    res.json({
      message: "Event deleted successfully",
      deletedEvent: event,
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({
      error: "Failed to delete event",
      details: error instanceof Error ? error.message : error,
    });
  }
});

// GET /api/admin/analytics/comprehensive - Get comprehensive analytics
router.get("/analytics/comprehensive", async (req: Request, res) => {
  try {
    const [
      totalEvents,
      totalTickets,
      totalRevenue,
      eventsByCategory,
      topEvents,
      monthlyStats,
    ] = await Promise.all([
      prisma.event.count(),
      prisma.ticket.count(),
      prisma.event.aggregate({
        _sum: { ticketPrice: true },
      }),
      prisma.event.groupBy({
        by: ["category"],
        _count: { category: true },
      }),
      prisma.event.findMany({
        take: 5,
        include: {
          _count: { select: { ticket: true } },
          organization: { select: { name: true } },
        },
        orderBy: { ticket: { _count: "desc" } },
        where: { status: "APPROVED" },
      }),
      prisma.$queryRaw`
        SELECT 
          DATE_FORMAT(date, '%b') as month,
          COUNT(*) as eventCount,
          COALESCE(SUM((SELECT COUNT(*) FROM Ticket WHERE Ticket.eventId = Event.id)), 0) as attendees
        FROM Event
        WHERE date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(date, '%Y-%m'), DATE_FORMAT(date, '%b')
        ORDER BY DATE_FORMAT(date, '%Y-%m') ASC
      `,
    ]);
    const totalCapacity = await prisma.event.aggregate({
      _sum: { capacity: true },
    });

    const avgAttendance =
      totalCapacity._sum.capacity && totalCapacity._sum.capacity > 0
        ? (totalTickets / totalCapacity._sum.capacity) * 100
        : 0;

    res.json({
      totalEvents,
      totalTickets,
      totalRevenue: Number(totalRevenue._sum.ticketPrice) || 0,
      avgAttendance: avgAttendance.toFixed(1),
      eventsByCategory: eventsByCategory.map((e) => ({
        name: e.category,
        value: e._count.category,
      })),
      topEvents: topEvents.map((e) => ({
        name: e.title,
        attendees: e._count.ticket,
        capacity: e.capacity,
        revenue: Number(e.ticketPrice) || 0,
        organization: e.organization.name,
      })),
      monthlyTrends: (monthlyStats as any[]).map((stat: any) => ({
        month: stat.month,
        eventCount: Number(stat.eventCount),
        attendees: Number(stat.attendees),
      })),
    });
  } catch (error) {
    console.error("Error fetching comprehensive analytics:", error);
    res.status(500).json({
      error: "Failed to fetch analytics",
      details: error instanceof Error ? error.message : error,
    });
  }
});

// GET /api/admin/analytics/participation
router.get("/analytics/participation", async (req, res) => {
  const ticketStats = await prisma.ticket.groupBy({
    by: ["checkedIn"],
    _count: true,
  });
  const monthlyEvents = await prisma.$queryRaw`
    SELECT DATE_FORMAT(date, '%Y-%m') as month, COUNT(*) as count
    FROM Event
    WHERE status = 'COMPLETED'
    GROUP BY month
    ORDER BY month DESC
    LIMIT 12
  `;
  res.json({ ticketStats, monthlyEvents });
});

// GET /api/admin/stats - Get platform statistics
router.get("/stats", async (req: Request, res) => {
  try {
    const [
      totalUsers,
      totalEvents,
      totalTickets,
      usersByRole,
      eventsByStatus,
      recentUsers,
      recentEvents,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.event.count(),
      prisma.ticket.count(),
      prisma.user.groupBy({
        by: ["role"],
        _count: { role: true },
      }),
      prisma.event.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
      prisma.event.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          status: true,
          date: true,
          createdAt: true,
          user: {
            select: { name: true },
          },
        },
      }),
    ]);
    res.json({
      totalUsers,
      totalEvents,
      totalTickets,
      usersByRole: usersByRole.reduce(
        (acc, curr) => {
          acc[curr.role] = curr._count.role;
          return acc;
        },
        {} as Record<string, number>,
      ),
      eventsByStatus: eventsByStatus.reduce(
        (acc, curr) => {
          acc[curr.status] = curr._count.status;
          return acc;
        },
        {} as Record<string, number>,
      ),
      recentUsers,
      recentEvents,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({
      error: "Failed to fetch statistics",
      details: error instanceof Error ? error.message : error,
    });
  }
});

export default router;
