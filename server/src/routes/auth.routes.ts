import * as Signup from "../middleware/auth/signupAuth.js";
import { logUserIn } from "../middleware/auth/loginAuth.js";
import { Router } from "express";
import { Request, Response } from "express";
import { newAccessToken } from "../middleware/auth/jwtAuth.js";
import * as TokenAuth from "../middleware/auth/jwtAuth.js";

const router = Router();

router.post(
  "/signup",
  Signup.validateUserCreation,
  Signup.validateStudentCreation,
  Signup.validateOrganizerCreation,
  Signup.addNewUser,
  (req: Request, res: Response) => {
    const createdUser = res.locals.createdUser;

    if (
      createdUser &&
      createdUser.role === "ORGANIZER" &&
      createdUser.accountStatus === "PENDING"
    ) {
      return res.status(201).json({
        message:
          "Account created successfully. Your organizer account is pending admin approval.",
        requiresApproval: true,
        user: {
          id: createdUser.id,
          email: createdUser.email,
          name: createdUser.name,
          role: createdUser.role,
          accountStatus: createdUser.accountStatus,
        },
      });
    }
    if (createdUser && createdUser.accountStatus === "APPROVED") {
      const tokens = TokenAuth.createTokens({
        id: createdUser.id,
        email: createdUser.email,
        role: createdUser.role,
      });

      return res.status(201).json({
        message: "User created successfully",
        ...tokens,
        userPublic: {
          id: createdUser.id,
          email: createdUser.email,
          name: createdUser.name,
          role: createdUser.role,
          studentId: createdUser.studentId,
          organizationId: createdUser.organizationId,
          accountStatus: createdUser.accountStatus,
        },
      });
    }
    res.status(201).json({
      message: "User created successfully",
    });
  },
);

router.post("/login", logUserIn);

router.post("/refresh", newAccessToken);

router.delete("/logout", (req: Request, res: Response) => {
  //for now just delete tokens on client side
  //TODO fix db migration divergnec and add refresh token table
  //remove token
  res.status(200).json({ message: "Logged out successfully" });
});

export default router;
