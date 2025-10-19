import "express";
import { UserRole } from "@prisma/client";

declare global {
    namespace Express {
        interface Request {
            user?: {
                name : string,
                email : string,
                role : UserRole,
                studentId : string | null
                iat?: number;
                exp?: number;
            }
        };
    }
}
