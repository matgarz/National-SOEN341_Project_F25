import { Request, Response, NextFunction} from "express";
import * as jwt from 'jsonwebtoken';
import { UserPublic } from "./authTypes.js";

const ACCESS_SECRET = process.env.ACCESS_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;
if (!ACCESS_SECRET || !REFRESH_SECRET) {
  throw new Error("Missing JWT secret token environment variables");
}

function createTokens(user : UserPublic) : {accessToken : string, refreshToken : string} {
    const accessToken = jwt.sign(user, ACCESS_SECRET!, {expiresIn : "30m"});
    const refreshToken = jwt.sign(user, REFRESH_SECRET!, {expiresIn: "30d"});
    return {accessToken, refreshToken};
}

function authenticateToken(req : Request, res : Response, next : NextFunction){
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1] || null;
    if (token == null) return res.sendStatus(401);


    //TODO maybe use callback instead of trycatch ---------- fpor this block
    try {
        const user = jwt.verify(token, ACCESS_SECRET!);
        req.user = user as UserPublic;
        next();
    } catch (err) {
        res.status(403).json({ error: "Invalid Token" });
    }
    //------------------------------------------------
}


function newAccessToken(req : Request, res : Response) {
    const refreshtoken = req.body.token;
    if(!refreshtoken){
        return res.status(401).json({message:"missing token"});
    }
    jwt.verify(refreshtoken, REFRESH_SECRET!, (error : any, user: any) => {
        if(error) return res.status(403).json({error:"invalid refresh token"}) // important for front end I think front end must log in again ask chat
        const userPublic: UserPublic = {...user};
        const accessToken = jwt.sign(userPublic, ACCESS_SECRET!, {expiresIn : "30m"});
        res.json({accessToken});
    }); 
}

export {authenticateToken, createTokens, newAccessToken}