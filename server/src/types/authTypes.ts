import { user_role } from "@prisma/client";
/**
 * User details sent back to the front end
 */
type UserPublic = {
  id: number;
  name: string;
  email: string;
  studentId: string | null;
  organizationId: string | null;
  role: user_role;
};

/**
 * internal, server side user type
 * to authenticate tokens and authorize actions
 */
type RequestUser = {
  id: number;
  role: user_role;
  email: string;
  orgnizationId?: number;
  accountStatus: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  authv?: number;
};

export { UserPublic, RequestUser };
