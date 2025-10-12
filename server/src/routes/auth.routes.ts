import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();

// Secret for JWT (in production, put in .env)
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// POST /api/auth/register
router.post('/register', async (req, res) => {
    const { name, password, role, organizationId, studentId } = req.body;

    if (!name || !password || !role) {
        return res.status(400).json({ error: 'Name, password, and role are required' });
    }

    try {
        // Optional: check if username already exists
        const existingUser = await prisma.user.findFirst({ where: { name } });
        if (existingUser) return res.status(409).json({ error: 'Username already taken' });

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate a dummy email if schema requires it
        const email = `${name.toLowerCase()}@example.com`;

        
        const now = new Date();

        // Create the user
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role.toUpperCase(),
                organizationId: role.toUpperCase() === 'ORGANIZER' ? organizationId : undefined,
                studentId: role.toUpperCase() === 'STUDENT' ? studentId : undefined,
                createdAt: now,
                updatedAt: now,
            },
        });


        // Generate JWT token
        const token = jwt.sign(
            {
                id: newUser.id,
                role: newUser.role,
                organizationId: newUser.organizationId || null,
            },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        // Return created user + token
        res.status(201).json({
            id: newUser.id,
            name: newUser.name,
            role: newUser.role,
            organizationId: newUser.organizationId || null,
            studentId: newUser.studentId || null,
            token,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Registration failed' });
    }
});

export default router;
