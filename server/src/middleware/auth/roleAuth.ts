import { Request, Response, NextFunction } from "express";
import { user_role } from "@prisma/client";

/**
 * Important
 * these are to be called after jwtAth.awthenticateToken()
 */

function authStudent(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  if (user?.role != user_role.STUDENT)
    res.status(403).json({ error: "unauthorized action" });
  next();
}

function authOrganizer(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  if (user?.role != user_role.ORGANIZER)
    res.status(403).json({ error: "unauthorized action" });
  next();
}
function authAdmin(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  if (user?.role != user_role.ADMIN)
    res.status(403).json({ error: "unauthorized action" });
  next();
}

export { authStudent, authOrganizer, authAdmin };
