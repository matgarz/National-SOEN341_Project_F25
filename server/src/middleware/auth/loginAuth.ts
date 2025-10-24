import * as TokenAuth from "./jwtAuth.js";
import { UserPublic, RequestUser } from "../../types/authTypes.js";
import { NextFunction } from "express";
import { Request, Response } from "express";
import { PrismaClient, UserRole, User } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

type UserLogin = {
  emailOrStudentId: string;
  password: string;
};

async function logUserIn(req: Request, res: Response, next: NextFunction) {
  const userToLogin: UserLogin = req.body;
  const user: User | null = await prisma.user.findFirst({
    where: {
      OR: [
        { email: userToLogin.emailOrStudentId },
        { studentId: userToLogin.emailOrStudentId },
      ],
    },
  });
  console.log(user);
  console.log(userToLogin.emailOrStudentId);
  console.log(userToLogin.password);
  if (!user) {
    return res.status(400).json({ error: "Email or Student Id was not found" });
  }
  if (!(await bcrypt.compare(userToLogin.password, user.password))) {
    res.status(401).json({ error: "invalid or incorrect password" });
  }
  if (!(await bcrypt.compare(userToLogin.password, user.password))) {
    res.status(401).send(); //TODO add real success response
  }

  const userPublic: UserPublic = { ...user };
  const requestUser: RequestUser = { ...user };

  res
    .status(200)
    .json({
      message: "Succesfully logged in",
      userPublic,
      ...TokenAuth.createTokens(requestUser),
    });
}

export { logUserIn };
