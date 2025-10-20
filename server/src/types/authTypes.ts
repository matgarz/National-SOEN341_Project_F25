import { UserRole } from "@prisma/client"
/**
 * User details sent back to the front end
 */
type UserPublic = {
    name : string,
    email : string,
    studentId : string | null
}

/**
 * internal, server side user type
 * to authenticate tokens and authorize actions
 */
type RequestUser = {
    id : number,
    role : UserRole,
    authv? : number
}

export {UserPublic, RequestUser};