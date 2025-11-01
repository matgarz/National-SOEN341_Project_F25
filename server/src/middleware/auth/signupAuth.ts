import { NextFunction } from "express";
import { Request, Response } from "express";
import { PrismaClient, user_role, accountstatus } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

/**
 * basic user fields
 * expected in Request Body
 * on Sign up
 */
interface UserSignUp {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: user_role;
  studentId?: string;
  organizationID?: number;
}

async function validateUserCreation(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userToCreate: UserSignUp = { ...req.body };
  const invalidSignup = validateUserSignUpFields(userToCreate);
  if (invalidSignup) {
    return res.status(400).json({ error: invalidSignup });
  }

  const invalidEmail = await validateNewUserEmail(userToCreate.email);
  if (invalidEmail) {
    return res.status(400).json({ error: invalidEmail });
  }

  next();
}

async function validateStudentCreation(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req.body.role != user_role.STUDENT) {
    next();
    return;
  }

  const studentToCreate: UserSignUp  = { ...req.body };
  if (!studentToCreate.studentId || studentToCreate.studentId.trim() === "") {
    return res.status(400).json({ error: "Student ID is required for student accounts" });
  }
  const validStudentId = await validateNewStudentId(studentToCreate.studentId);

  if (validStudentId) {
    return res.status(400).json({ error: validStudentId });
  }
  next();
}

async function validateOrganizerCreation(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req.body.role != user_role.ORGANIZER) {
    next();
    return;
  }
  const organizerToCreate: UserSignUp  = { ...req.body };

  if (!organizerToCreate.organizationID) {
    return res.status(400).json({
      error: "Organization selection is required for organizer accounts",
    });
  }

  if (
    typeof organizerToCreate.organizationID !== "number" ||
    isNaN(organizerToCreate.organizationID)
  ) {
    return res.status(400).json({
      error: "Invalid organization ID",
    });
  }

  try {
    const organization = await prisma.organization.findUnique({
      where: { id: organizerToCreate.organizationID },
    });

    if (!organization) {
      return res.status(400).json({
        error: "Selected organization does not exist",
      });
    }

    if (!organization.isActive) {
      return res.status(400).json({
        error: "Selected organization is not active",
      });
    }
  } catch (error) {
    console.error("Error validating organization:", error);
    return res.status(500).json({
      error: "Failed to validate organization",
    });
  }
  next();
}

async function addNewUser(req: Request, res: Response, next: NextFunction) {
  const userToCreate: UserSignUp = { ...req.body };
  try {
    const createdUser = await addUserToDB(userToCreate);
    next();
  } catch (error) {
    console.error("Failed to create user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
}

//sign up helpers--------------------------------------------------------

function validateUserSignUpFields(userToCreate: UserSignUp): string {
  if (
    typeof userToCreate.firstName !== "string" ||
    typeof userToCreate.lastName !== "string" ||
    typeof userToCreate.email !== "string" ||
    typeof userToCreate.password !== "string"
  ) {
    console.log(userToCreate);
    console.log(userToCreate.firstName);
    console.log(typeof userToCreate.lastName);
    console.log(typeof userToCreate.password);
    console.log(typeof userToCreate.email);
    return "Invalid sign up fields"; //TODO more precise error message maybe
  }
  if (!Object.values(user_role).includes(userToCreate.role)) {
    return "invalid role";
  }
  return "";
}

async function validateNewUserEmail(email: string): Promise<string> {
  const emailInUse = await prisma.user.findFirst({
    where: { email },
  });
  if (emailInUse) {
    return "email already in use";
  }
  return "";
}

async function validateNewStudentId(studentId: string): Promise<string> {
  const IdInUse = await prisma.user.findFirst({
    where: { studentId },
  });
  if (IdInUse) {
    return "Student ID already in use";
  }
  return "";
}


async function addUserToDB(userToCreate: UserSignUp) {
  const hashedPassword = await bcrypt.hash(userToCreate.password, 10);

  const fullName = `${userToCreate.firstName} ${userToCreate.lastName}`;

  const userData: any = {
    name: fullName,
    email: userToCreate.email,
    password: hashedPassword,
    role: userToCreate.role,
  };

  if (userToCreate.role === user_role.STUDENT) {
    userData.studentId = userToCreate.studentId;
    userData.accountStatus = accountstatus.APPROVED;
  }

  if (userToCreate.role === user_role.ORGANIZER) {
    userData.organizationId = userToCreate.organizationID;
    userData.accountStatus = accountstatus.PENDING; // Requires admin approval
  }

  if (userToCreate.role === user_role.ADMIN) {
    userData.accountStatus = accountstatus.APPROVED;
  }

  const newUser = await prisma.user.create({
    data: userData,
  });

  return newUser;
}

export {
  addNewUser,
  validateUserCreation,
  validateStudentCreation,
  validateOrganizerCreation,
};
