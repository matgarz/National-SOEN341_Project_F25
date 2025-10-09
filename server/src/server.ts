import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import eventRoutes from './routes/events.routes';

dotenv.config(); //to access the .env data without leaking passwords

const app = express();
const PORT = 3001;

// allowing Vite frontend to access the backend
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? "http://localhost:5173";

app.use(cors({
  origin: FRONTEND_ORIGIN,
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
  credentials: false // true if we are using cookies in website
}));
app.use(express.json());



app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Hello from Express + TypeScript!' });
});

app.use('/api/events', eventRoutes);

console.log("booting server")

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
