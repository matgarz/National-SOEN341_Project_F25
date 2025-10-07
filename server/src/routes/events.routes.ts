//All current Imports required
import { Router } from 'express';
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

//These GET comments describe what GET page they are requesting from

// GET /api/events = Get all upcoming events

router.get('/', async (req: Request, res: Response) => {
  try {

    const events = await prisma.event.findMany({
      where: { 
        status: 'APPROVED',
        date: { gte: new Date() } // Only upcoming events are sorted
      },
      include: {
        organization: true,
        creator: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { tickets: true }
        }
      },
      orderBy: { date: 'asc' }
    });

    res.json(events);
    
  } catch (error) {             // catching errors
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// GET /api/events/:id = Get single event by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {

    const event = await prisma.event.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        organization: true,
        creator: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { tickets: true }
        }
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (error) {         // catching errors
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

export default router;