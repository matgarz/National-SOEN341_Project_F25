import { Request, Response, NextFunction} from "express";
import { UserRole} from '@prisma/client';



/**
 * Important
 * these are to be called after jwtAth.awthenticateToken()
 */


function authStudent(req : Request, res : Response, next : NextFunction){
    
    const user = req.user
    if(user?.role != UserRole.STUDENT) res.status(403).json({error:"unauthorized action"});
    next();
}

function authOrganizer(req : Request, res : Response, next : NextFunction){
    
    const user = req.user
    if(user?.role != UserRole.ORGANIZER) res.status(403).json({error:"unauthorized action"});
    next();
}
function authAdmin(req : Request, res : Response, next : NextFunction){
    
    const user = req.user
    if(user?.role != UserRole.ADMIN) res.status(403).json({error:"unauthorized action"});
    next();
}

export {authStudent, authOrganizer, authAdmin}