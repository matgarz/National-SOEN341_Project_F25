import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export interface AuthRequest extends Request {
    user?: { id: number; role: string; organizationId?: number | null };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Missing token' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Missing token' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Role check
export const requireRole = (role: 'STUDENT' | 'ORGANIZER' | 'ADMIN') => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || req.user.role !== role) {
            return res.status(403).json({ error: 'Forbidden: insufficient role' });
        }
        next();
    };
};

export const requireAdmin = requireRole('ADMIN')

export const requireOrganizerOrAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
if (!req.user || (req.user.role !== 'ORGANIZER' && req.user.role !== 'ADMIN')) {
        return res.status(403).json({ error: 'Forbidden: Organizer or Admin role required' });
    }
    next();
};
