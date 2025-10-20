import "express";
import { RequestUser } from "./authTypes.ts";

declare global {
    namespace Express {
        interface Request {
            user? : RequestUser 
        };
    }
}
