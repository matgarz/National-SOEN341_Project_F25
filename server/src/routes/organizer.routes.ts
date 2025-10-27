// src/routes/organizer.routes.ts
import { Router, Request, Response } from "express";
import prisma from "../lib/prisma"; // make sure this points to your Prisma client instance

const router = Router();

// Create a new organizer
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, phone, website, logoUrl, department, organizationId } =
      req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    // Create the organizer
    const newOrganizer = await prisma.organizer.create({
      data: {
        name,
        email,
        phone,
        website,
        logoUrl,
        department,
        organizationId: organizationId || null, // optional
        isActive: true,
      },
    });

    return res.status(201).json(newOrganizer);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to create organizer" });
  }
});

export default router;
