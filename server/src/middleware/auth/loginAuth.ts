import * as TokenAuth from "./jwtAuth.js";
import { UserPublic, RequestUser } from "../../types/authTypes.js";
import { NextFunction } from "express";
import { Request, Response } from "express";
import { PrismaClient, user_role, user } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

type UserLogin = {
  emailOrStudentId: string;
  password: string;
};

async function logUserIn(req: Request, res: Response, next: NextFunction) {
  const userToLogin: UserLogin = req.body;
  const user: user | null = await prisma.user.findFirst({
    where: {
      OR: [
        { email: userToLogin.emailOrStudentId },
        { studentId: userToLogin.emailOrStudentId },
      ],
    },
    include: {
      organization: true,
    },
  });
  console.log(user);
  console.log(userToLogin.emailOrStudentId);
  console.log(userToLogin.password);
  if (!user) {
    return res.status(400).json({ error: "Email or Student Id was not found" });
  }
  if (user.accountStatus === "PENDING") {
    return res.status(403).json({
      error: "Account pending approval",
      message:
        "Your organizer account is awaiting admin approval. You will be notified once approved.",
    });
  }
  if (user.accountStatus === "REJECTED") {
    return res.status(403).json({
      error: "Account rejected",
      message:
        "Your organizer account request was not approved. Please contact support for more information.",
    });
  }
  if (user.accountStatus === "SUSPENDED") {
    return res.status(403).json({
      error: "Account suspended",
      message: "Your account has been suspended. Please contact support.",
    });
  }
  if (!(await bcrypt.compare(userToLogin.password, user.password))) {
    res.status(401).json({ error: "invalid or incorrect password" });
  }

  const userPublic: UserPublic = { ...user };
  const requestUser: RequestUser = { ...user };

  res.status(200).json({
    message: "Succesfully logged in",
    userPublic,
    ...TokenAuth.createTokens(requestUser),
  });
}

export { logUserIn };
