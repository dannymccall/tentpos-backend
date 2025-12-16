import { AuthController } from "../controllers/AuthController.js";
import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";

export class AuthRoutes {
    private controller: AuthController;
    public router: Router;

    constructor(){
        this.router = Router();
        this.controller = new AuthController();
        this.initializeAuthRoutes();
    }

    private initializeAuthRoutes(){
        this.router.post("/exchange", this.controller.exchange.bind(this.controller));
        this.router.get("/me", requireAuth, this.controller.getMe.bind(this.controller));
        this.router.post("/signout", requireAuth, this.controller.signout.bind(this.controller))
    }
}