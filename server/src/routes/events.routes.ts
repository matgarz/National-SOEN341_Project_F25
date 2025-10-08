//All current Imports required
import { Router } from 'express';
import type { Request, Response } from 'express';
import { PrismaClient, type Prisma } from '@prisma/client';
import { emit } from 'process';

const router = Router();
const prisma = new PrismaClient();

//These GET comments describe what GET page they are requesting from
// this is for the events api
router.get("/", async (req: Request, res: Response) => {
  try {
    const upcomingOnly = String(req.query.upcoming ?? "").toLowerCase() === "true";

    const where: Prisma.eventWhereInput = {
      status: "APPROVED",
      ...(upcomingOnly ? { date: { gte: new Date() } } : {}),
    };

    const events = await prisma.event.findMany({
      where,
      include: {
        organization: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true } },
        // Organizer: { select: { id: true, name: true } },
        _count: { select: { ticket: true } },
      },
      orderBy: { date: "asc" },
    });

    res.json(events);
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ error: "Failed to fetch events 1" });
  }
});

// GET /api/events/search?keyword=yourKeyword
router.get('/search', async (req : Request, res : Response) => {
try {
  const keyword = req.query.keyword as string;

  if (!keyword) { 
    return res.status(400).json({ error: 'Search query is required'})
  }

  const events = await prisma.event.findMany({
    where: {
      status: 'APPROVED',
      date: { gte: new Date() },
      OR: [ // Searches title and description
        { title: { contains: keyword }}, 
        {description: { contains: keyword }}
      ]
    },

    include: {
      organization : true,
      user: {
        select: { id : true, name : true, email : true}
      },
      _count: { 
        select: { ticket: true}
      }
    },
    orderBy: { date: 'asc'}
  });
  res.json(events);

} catch (error) { 
  console.error('Error searching events: ', error);
  res.status(500).json({ error: 'Failed to search events' });
}
});


// GET /api/events = Get all upcoming events

router.get('/:id', async (req: Request, res: Response) => {
  try {


    const events = await prisma.event.findMany({
      where: { 
        status: 'APPROVED',
        date: { gte: new Date() } // Only upcoming events are sorted
      },
      include: {
        organization: true,
        user: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { ticket: true }
        }
      },
      orderBy: { date: 'asc' }
    });

    res.json(events);
    
  } catch (error) {             // catching errors
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events 2' });
  }
});

// GET /api/events/:id = Get single event by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {

    const event = await prisma.event.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        organization: true,
        user: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { ticket: true }
        }
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (error) {         // catching errors
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event 3' });
  }
});

export default router;