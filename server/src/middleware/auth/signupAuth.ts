import { NextFunction} from 'express';
import { Request, Response } from "express";
import { PrismaClient, UserRole, User} from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

type UserSignUp = {
    firstName: string,
    lastName : string,
    email : string,
    password : string,
    role : UserRole   
    studentId: string | null
}

type UserMinimal = {
    name : string,
    email : string,
    password : string,
    role : UserRole
    studentId: string | null;
}

async function validateUserCreation(req : Request, res : Response, next : NextFunction) {
    const userToCreate : UserSignUp =  req.body; 
    const validTypes : string = validateUserTypes(userToCreate);
    const validEmail : string = await validateNewUserEmail(userToCreate);
    const validStudentId : string = await validateNewStudentId(userToCreate);

    //TODO maybe reduce the number of db operations by merging validate email and validate id
    if(validTypes){
        return res.status(400).json({ error: validTypes }); 
    }
    if(validEmail){
        return res.status(400).json({ error: validEmail });
    }
    if(validStudentId){
        return res.status(400).json({ error: validStudentId });
    }
    next();
    //maybe using strings like this is bad maybe the functions should return a {message:string, isValid:boolean}
}

function validateUserTypes(userToCreate : UserSignUp) : string{

    if (
    typeof userToCreate.firstName !== "string" ||
    typeof userToCreate.lastName !== "string" ||
    typeof userToCreate.email !== "string" ||
    typeof userToCreate.password !== "string" ||
    !Object.values(UserRole).includes(userToCreate.role)
    ){
    return "Invalid body format"; //TODO more precise error message
    }
    return "";
}

async function validateNewUserEmail(userToCreate : UserSignUp) : Promise<string>{
    const emailInUse = await prisma.user.findFirst(
        { 
            where: {email : userToCreate.email}
        }
    );
    if (emailInUse){
    return "email already in use" ;
    }
    return "";
}

async function validateNewStudentId(userToCreate : UserSignUp) : Promise<string>{

    if (userToCreate.studentId == null && userToCreate.role != UserRole.STUDENT){
        return "";
    } 
    const IdInUse = await prisma.user.findFirst(
        { 
            where: {studentId : userToCreate.studentId}
        }
    );
    if (IdInUse){
    return "Student ID already in use" ;
    }
    return "";
}

async function addNewUser(req : Request, res : Response, next : NextFunction){
    try {
        const createdUser = await addUserToDB(req.body);
        const { password, ...safeUser } = createdUser;
    } catch (error) {
        console.error("Failed to create user:", error);
        res.status(500).json({ error: "Failed to create user" });
    }
    next();
}

async function createUser( userToCreate : UserSignUp) : Promise<UserMinimal>{

    const encryptedPassword = await generateSecurePassword(userToCreate.password);
    const studentId = userToCreate.studentId;
    const newUser : UserMinimal = {
        name: userToCreate.firstName + " " + userToCreate.lastName,
        email: userToCreate.email,
        password: encryptedPassword,
        role : userToCreate.role,
        studentId
    }

    return newUser;
}

async function generateSecurePassword(password : string) : Promise<string>{
    const salt = await bcrypt.genSalt();
    const encryptedPassword = await bcrypt.hash(password, salt);
    return encryptedPassword;
}

async function addUserToDB(userToCreate : UserSignUp) : Promise<UserMinimal> {

    const newUser = await createUser(userToCreate);
    const now = new Date();
    return await prisma.user.create(
        {
            data: {
                name : newUser.name,
                email : newUser.email,
                password : newUser.password,
                role : newUser.role,
                studentId : newUser.studentId,
                createdAt: now,
                updatedAt: now
            }
        }
    );
}

export { addNewUser, validateUserCreation}