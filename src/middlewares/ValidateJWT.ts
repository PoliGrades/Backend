import { NextFunction, Request, Response } from "express";
import { AuthenticationService } from "../services/AuthenticationService.ts";

export class ValidateJWT {
    private authService: AuthenticationService;
    
    constructor(authService: AuthenticationService) {
        this.authService = authService;
        this.validateToken = this.validateToken.bind(this);
    }

    async validateToken(req: Request, res: Response, next: NextFunction) {
        const token = req.cookies.token;
        
        if (!token) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        await this.authService.verifyJWT(token)
        .then(() => {
            next();
        })
        .catch(() => {
            res.status(401).json({ error: "Invalid token" });
        });
    }
}