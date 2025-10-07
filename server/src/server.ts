import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import eventRoutes from './routes/events.routes.ts';

dotenv.config(); //to access the .env data without leaking passwords

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get('/api/hello', (req: Request, res: Response) => {
  res.json({ message: 'Hello from Express + TypeScript!' });
});

app.use('/api/events', eventRoutes);

console.log("booting server")

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
