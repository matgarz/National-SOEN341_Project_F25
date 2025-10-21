import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = Router();
const prisma = new PrismaClient();

// Secret for JWT (in production, put in .env)
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Registration Endpoint: POST /api/auth/register
router.post("/register", async (req, res) => {
  const { name, password, email, role, organizationId, studentId } = req.body;

  if (!name || !password || !email || !role) {
    return res
      .status(400)
      .json({ error: "Username, password, email and role are required!" });
  }

  try {
    // Optional: check if username already exists
    const existingUser = await prisma.user.findFirst({ where: { name } });
    if (existingUser)
      return res.status(409).json({ error: "Username already taken" });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a dummy email if schema requires it
    // const email = `${name.toLowerCase()}@example.com`;

    const now = new Date();

    // Create the user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role.toUpperCase(),
        organizationId:
          role.toUpperCase() === "ORGANIZER" ? organizationId : undefined,
        studentId: role.toUpperCase() === "STUDENT" ? studentId : undefined,
        createdAt: now,
        updatedAt: now,
      },
    });

    // Create JWT token
    const token = jwt.sign(
      {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      JWT_SECRET,
      { expiresIn: "8h" },
    );

    res.json({ ...newUser, token });
  } catch (err) {
    res.status(500).json({ error: "Registration failed", details: err });
  }
});

// Login endpoint: POST /api/auth/login
router.post("/login", async (req, res) => {
  const { name, password } = req.body;
  if (!name || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }
  try {
    const user = await prisma.user.findFirst({ where: { name } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid password" });

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "8h" },
    );
    res.json({ ...user, token });
  } catch (err) {
    res.status(500).json({ error: "Login failed", details: err });
  }
});

export default router;
