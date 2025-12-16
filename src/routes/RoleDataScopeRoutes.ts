import { RoleDataScopeController } from "../controllers/RoleDataScopeController.js";
import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";

export class RoleDataScopeRoutes {
    private controller: RoleDataScopeController;
    public router: Router;

    constructor(){
        this.controller = new RoleDataScopeController();
        this.router = Router();
        this.initializeRoleDataScopeRoutes()
    }

    private initializeRoleDataScopeRoutes(){
        this.router.post("/update", requireAuth, this.controller.addRoleDataScope.bind(this.controller));

        this.router.get("/", requireAuth, this.controller.getRoleDataScope.bind(this.controller));
    }
}