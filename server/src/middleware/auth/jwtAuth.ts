import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserPublic, RequestUser } from "../../types/authTypes.js";

const ACCESS_SECRET = process.env.ACCESS_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;
if (!ACCESS_SECRET || !REFRESH_SECRET) {
  throw new Error("Missing JWT secret token environment variables");
}

function createAccessToken(user: RequestUser): string {
  return jwt.sign(user, ACCESS_SECRET!, { expiresIn: "30m" });
}

function createRefreshToken(user: RequestUser): string {
  return jwt.sign(user, REFRESH_SECRET!, { expiresIn: "14d" });
}

function createTokens(user: RequestUser): {
  accessToken: string;
  refreshToken: string;
} {
  return {
    accessToken: createAccessToken(user),
    refreshToken: createRefreshToken(user),
  };
}

function readBearer(req: Request): string | null {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return null;
  const token = authHeader?.split(" ")[1] || null;
  return token;
}

function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const token = readBearer(req);
  if (token == null)
    return res.status(401).json({ error: "Missing Access Token" });

  //TODO maybe use callback instead of trycatch ---------- fpor this block
  try {
    const user = jwt.verify(token, ACCESS_SECRET!);
    req.user = user as RequestUser;
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid Token" });
  }
  //------------------------------------------------
}

function newAccessToken(req: Request, res: Response) {
  const refreshtoken = req.body.refreshToken;
  if (!refreshtoken) {
    return res.status(401).json({ message: "missing token" });
  }
  jwt.verify(refreshtoken, REFRESH_SECRET!, (error: any, user: any) => {
    if (error) return res.status(403).json({ error: "invalid refresh token" }); // important for front end I think front end must log in again ask chat
    const userPublic: UserPublic = { ...user };
    const accessToken = jwt.sign(userPublic, ACCESS_SECRET!, {
      expiresIn: "30m",
    });
    res.json({ accessToken });
  });
}

export { authenticateToken, createTokens, newAccessToken };
