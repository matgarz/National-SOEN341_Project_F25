import * as Signup from "../middleware/auth/signupAuth.js";
import { logUserIn } from "../middleware/auth/loginAuth.js";
import { Router } from "express";
import { Request, Response } from "express";
import { newAccessToken } from "../middleware/auth/jwtAuth.js";

const router = Router();

router.post(
  "/signup",
  Signup.validateUserCreation,
  Signup.validateStudentCreation,
  Signup.validateOrganizerCreation,
  Signup.addNewUser,
  (req: Request, res: Response) => {
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
});

export default router;
