import { NextFunction } from "express";
import { Request, Response } from "express";
import { PrismaClient, UserRole, User } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

/**
 * basic user fields
 * expected in Request Body
 * on Sign up
 */
type UserSignUp = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
};

/**
 * Student specific fields
 * expected in request Body
 * when user is student
 */
type StudentSignUp = {
  studentId: string;
};

/**
 * additional fields expected on user sign up
 * when user is an organizer
 */
type OrganizerSignUp = {
  phone: string;
  website: string;
  department: string;
};

type UserMinimal = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  studentId: string | null;
};

type OrganizerMinimal = {
  name: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  department: string | null;
};

async function validateUserCreation(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userToCreate: UserSignUp = { ...req.body };
  const validFields: string = validateUserSignUpFields(userToCreate);
  const validEmail: string = await validateNewUserEmail(userToCreate.email);

  //TODO maybe reduce the number of db operations by merging validate email and validate id
  if (validFields) {
    return res.status(400).json({ error: validFields });
  }
  if (validEmail) {
    return res.status(400).json({ error: validEmail });
  }
  next();
  //maybe using strings like this is bad maybe the functions should return a {message:string, isValid:boolean}
}

async function validateStudentCreation(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req.body.role != UserRole.STUDENT) {
    next();
    return;
  }

  const studentToCreate: StudentSignUp = { ...req.body };
  const validStudentId: string = await validateNewStudentId(
    studentToCreate.studentId,
  );

  if (validStudentId) {
    return res.status(400).json({ error: validStudentId });
  }
  next();
  //maybe using strings like this is bad maybe the functions should return a {message:string, isValid:boolean}
}

async function validateOrganizerCreation(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req.body.role != UserRole.ORGANIZER) {
    next();
    return;
  }

  const organizerToCreate: OrganizerSignUp = { ...req.body };

  const validFields: string = validateNewOrganizerFields(organizerToCreate);
  const validPhone: string = await validateNewOrganizerPhone(
    organizerToCreate.phone,
  );

  //TODO maybe reduce the number of db operations by merging validate email and validate id
  if (validFields) {
    return res.status(400).json({ error: validFields });
  }
  if (validPhone) {
    return res.status(400).json({ error: validPhone });
  }
  next();
  //maybe using strings like this is bad maybe the functions should return a {message:string, isValid:boolean}
}

async function addNewUser(req: Request, res: Response, next: NextFunction) {
  const userToCreate: UserSignUp = { ...req.body };
  const studentToCreate: StudentSignUp = { ...req.body };
  const organizerToCreate: OrganizerSignUp = { ...req.body };

  try {
    const createdUser = await addUserToDB(
      userToCreate,
      studentToCreate,
      organizerToCreate,
    );
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
  if (!Object.values(UserRole).includes(userToCreate.role)) {
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

function validateNewOrganizerFields(
  organizerToCreate: OrganizerSignUp,
): string {
  if (
    typeof organizerToCreate.department !== "string" ||
    typeof organizerToCreate.website !== "string" ||
    typeof organizerToCreate.phone !== "string"
  )
    return "Invalid organizer signup request";

  //TODO validate Website, potentiallly move this to front end idk yet

  return "";
}

async function validateNewOrganizerPhone(phoneNumb: string): Promise<string> {
  const IdInUse = await prisma.organizer.findFirst({
    where: { phone: phoneNumb },
  });
  if (IdInUse) {
    return "phone number already in use";
  }
  return "";
}

async function createUser(
  userToCreate: UserSignUp,
  studentToCreate: StudentSignUp,
  organizerToCreate: OrganizerSignUp,
): Promise<UserMinimal> {
  const encryptedPassword = await generateSecurePassword(userToCreate.password);

  let name = "";
  let studentId = null;
  if (userToCreate.role === UserRole.STUDENT) {
    studentId = studentToCreate.studentId;
  }
  if (userToCreate.role === UserRole.ORGANIZER) {
    const newOrganizer = await addOrganizerToDB(
      userToCreate,
      organizerToCreate,
    );
  }

  const newUser: UserMinimal = {
    name: userToCreate.firstName + " " + userToCreate.lastName,
    email: userToCreate.email,
    password: encryptedPassword,
    role: userToCreate.role,
    studentId,
  };

  return newUser;
}

async function createOrganizer(
  userToCreate: UserSignUp,
  organizerToCreate: OrganizerSignUp,
): Promise<OrganizerMinimal> {
  const newOrganizer: OrganizerMinimal = {
    name: userToCreate.firstName + " " + userToCreate.lastName,
    email: userToCreate.email,
    phone: organizerToCreate.phone,
    website: organizerToCreate.website,
    department: organizerToCreate.department,
  };

  return newOrganizer;
}

async function generateSecurePassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt();
  const encryptedPassword = await bcrypt.hash(password, salt);
  return encryptedPassword;
}

async function addUserToDB(
  userToCreate: UserSignUp,
  studentToCreate: StudentSignUp,
  organizerToCreate: OrganizerSignUp,
): Promise<UserMinimal> {
  const newUser: UserMinimal = await createUser(
    userToCreate,
    studentToCreate,
    organizerToCreate,
  );
  const now = new Date();
  return await prisma.user.create({
    data: {
      name: newUser.name,
      email: newUser.email,
      password: newUser.password,
      role: newUser.role,
      studentId: newUser.studentId,
      createdAt: now,
      updatedAt: now,
    },
  });

  console.log("usercreated");
  console.log(newUser);
}

async function addOrganizerToDB(
  userToCreate: UserSignUp,
  organizerToCreate: OrganizerSignUp,
): Promise<OrganizerMinimal> {
  const newOrganizer: OrganizerMinimal = await createOrganizer(
    userToCreate,
    organizerToCreate,
  );
  const now = new Date();
  return await prisma.organizer.create({
    data: {
      name: newOrganizer.name,
      email: newOrganizer.email,
      phone: newOrganizer.phone,
      website: newOrganizer.website,
      department: newOrganizer.department,
      createdAt: now,
      updatedAt: now,
      isActive: true,
    },
  });
}

export {
  addNewUser,
  validateUserCreation,
  validateStudentCreation,
  validateOrganizerCreation,
};
