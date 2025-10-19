import { Router } from 'express';
import { PrismaClient, UserRole, EventStatus } from '@prisma/client';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/authMiddleware.js';
const router = Router();
const prisma = new PrismaClient();
router.use(authenticate, requireAdmin);
// GET /api/admin/users - Get all users with optional filtering
router.get('/users', async (req: AuthRequest, res) => {
    try {
        const { role, search } = req.query;

        const users = await prisma.user.findMany({
            where: {
                ...(role && { role: role as UserRole }),
                ...(search && {
                    OR: [ { name: { contains: search as string } }, { email: { contains: search as string } }, { studentId: { contains: search as string } } ]
                        }
                    )
            },
            select: {id: true, email: true, name: true, studentId: true, role: true, createdAt: true, updatedAt: true,
                _count: {
                    select: {event: true, ticket: true, review: true}
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users', details: error instanceof Error ? error.message : error });
    }
});

// GET /api/admin/users/:id - Get single user with full details
router.get('/users/:id', async (req: AuthRequest, res) => {
    try {
        const userId = parseInt(req.params.id);
        if (isNaN(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                event: {
                    select: { id: true,title: true, date: true, status: true, location: true},
                    orderBy: { date: 'desc' }
                },
                ticket: {
                    select: { id: true,
                        event: {
                            select: { title: true, date: true }
                        },
                        claimed: true, checkedIn: true, createdAt: true
                    },
                    orderBy: { createdAt: 'desc' }
                },
                review: {
                    select: {
                        id: true, rating: true, comment: true,
                        event: {
                            select: { title: true }
                        },
                        createdAt: true
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ 
            error: 'Failed to fetch user',
            details: error instanceof Error ? error.message : error});
    }
});

// PATCH /api/admin/users/:id/role - Update user role
router.patch('/users/:id/role', async (req: AuthRequest, res) => {
    try {
        const userId = parseInt(req.params.id);
        const { role } = req.body;
        if (isNaN(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
        // Validate role
        if (!Object.values(UserRole).includes(role)) {
            return res.status(400).json({error: 'Invalid role. Must be one of: STUDENT, ORGANIZER, ADMIN' });
        }
        // Prevent admin from demoting themselves
        if (userId === req.user!.id && role !== 'ADMIN') {
            return res.status(400).json({ 
                error: 'Cannot change your own admin role' 
            });
        }
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { role, updatedAt: new Date()},
            select: {id: true, email: true, name: true, role: true, updatedAt: true}
        });
        res.json({
            message: 'User role updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({ 
            error: 'Failed to update user role',
            details: error instanceof Error ? error.message : error});
    }
});
// DELETE /api/admin/users/:id - Delete user
router.delete('/users/:id', async (req: AuthRequest, res) => {
    try {
        const userId = parseInt(req.params.id);
        if (isNaN(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
        // Prevent admin from deleting themselves
        if (userId === req.user!.id) {
            return res.status(400).json({ 
                error: 'Cannot delete your own account' 
            });
        }
        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Delete user
        await prisma.user.delete({
            where: { id: userId }
        });
        res.json({ 
            message: 'User deleted successfully',
            deletedUser: { id: user.id, name: user.name, email: user.email}
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ 
            error: 'Failed to delete user',
            details: error instanceof Error ? error.message : error 
        });
    }
});

// GET /api/admin/events - Get all events (including PENDING/REJECTED)
router.get('/events', async (req: AuthRequest, res) => {
    try {
        const { status, organizationId, category } = req.query;

        const events = await prisma.event.findMany({
            where: {
                ...(status && { status: status as EventStatus }),
                ...(organizationId && { organizationId: parseInt(organizationId as string) }),
                ...(category && { category: category as string })
            },
            include: {
                organization: {
                    select: { id: true, name: true, isActive: true }
                },
                organizer: {
                    select: { id: true, name: true, email: true }
                },
                creator: {
                    select: { id: true, name: true, email: true, role: true }
                },
                _count: {
                    select: {
                        ticket: true,
                        reviews: true,
                        savedBy: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ 
            error: 'Failed to fetch events',
            details: error instanceof Error ? error.message : error 
        });
    }
});

// PATCH /api/admin/events/:id/status - Update event status
router.patch('/events/:id/status', async (req: AuthRequest, res) => {
    try {
        const eventId = parseInt(req.params.id);
        const { status } = req.body;
        if (isNaN(eventId)) {
            return res.status(400).json({ error: 'Invalid event ID' });
        }
        // Validate status
        const validStatuses = Object.values(EventStatus);
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
            });
        }
        const updatedEvent = await prisma.event.update({
            where: { id: eventId },
            data: {status, updatedAt: new Date()},
            include: {
                organization: true,
                creator: {
                    select: { id: true, name: true, email: true }
                }
            }
        });
        res.json({
            message: 'Event status updated successfully',
            event: updatedEvent
        });
    } catch (error) {
        console.error('Error updating event status:', error);
        res.status(500).json({ 
            error: 'Failed to update event status',
            details: error instanceof Error ? error.message : error 
        });
    }
});

// DELETE /api/admin/events/:id - Delete event
router.delete('/events/:id', async (req: AuthRequest, res) => {
    try {
        const eventId = parseInt(req.params.id);
        if (isNaN(eventId)) {
            return res.status(400).json({ error: 'Invalid event ID' });
        }
        // Check if event exists
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            select: { id: true, title: true }
        });
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        // Delete event
        await prisma.event.delete({
            where: { id: eventId }
        });
        res.json({ 
            message: 'Event deleted successfully',
            deletedEvent: event
        });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ 
            error: 'Failed to delete event',
            details: error instanceof Error ? error.message : error 
        });
    }
});

// GET /api/admin/stats - Get platform statistics
router.get('/stats', async (req: AuthRequest, res) => {
    try {
        const [totalUsers, totalEvents, totalTickets, usersByRole, eventsByStatus, recentUsers, recentEvents] = await Promise.all([
            prisma.user.count(),
            prisma.event.count(),
            prisma.ticket.count(),
            prisma.user.groupBy({
                by: ['role'],
                _count: { role: true }
            }),
            prisma.event.groupBy({
                by: ['status'],
                _count: { status: true }
            }),
            prisma.user.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {id: true, name: true, email: true, role: true, createdAt: true}
            }),
            prisma.event.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {id: true, title: true, status: true, date: true, createdAt: true,
                    creator: {
                        select: { name: true }
                    }
                }
            })
        ]);
        res.json({totalUsers, totalEvents, totalTickets,
            usersByRole: usersByRole.reduce((acc, curr) => {
                acc[curr.role] = curr._count.role;
                return acc;
            }, {} as Record<string, number>),
            eventsByStatus: eventsByStatus.reduce((acc, curr) => {
                acc[curr.status] = curr._count.status;
                return acc;
            }, {} as Record<string, number>),
            recentUsers, recentEvents
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ 
            error: 'Failed to fetch statistics',
            details: error instanceof Error ? error.message : error 
        });
    }
});
export default router;