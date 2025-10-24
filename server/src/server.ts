import dotenv from "dotenv";
dotenv.config();

import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import eventRoutes from "./routes/events.routes.js";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const app = express();
const PORT = 3001;

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? "http://localhost:5173";

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
  }),
);

app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "server is listening" });
});

// Mount both routes
app.use("/api/events", eventRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

console.log("Booting server...");

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
