import * as TokenAuth from "./jwtAuth.js"
import { UserPublic } from "./authTypes.js";
import { NextFunction } from 'express';
import { Request, Response } from "express";
import { PrismaClient, UserRole, User} from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

type UserLogin = {
    emailOrStudentID : string,
    password : string
}

async function logUserIn(req : Request, res : Response, next : NextFunction){

    const userToLogin : UserLogin = req.body;
    const user : User | null =  await prisma.user.findFirst(
        {
            where : {
                OR: [
                    { email: userToLogin.emailOrStudentID },
                    { studentId: userToLogin.emailOrStudentID }
                ]
            },
        }
    );
    if(!user){
        return res.status(400).json({error : "Email or Student Id was not found"})
    }
    if(!await bcrypt.compare(userToLogin.password, user.password)){
        res.status(401).json({error:"invalid or incorrect password"}); 
    }
    if(!await bcrypt.compare(userToLogin.password, user.password)){
        res.status(401).send(); //TODO add real success response
    }
    
    const userPublic : UserPublic = {...user};

    res.status(200).json({message:"Succesfully logged in", ...TokenAuth.createTokens(userPublic)});
}

export {logUserIn}