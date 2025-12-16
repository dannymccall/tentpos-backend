import { BranchController } from "../controllers/BranchController.js";
import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
export class BranchRoutes {
    private controller: BranchController;
    public router: Router;

    constructor(){
        this.controller = new BranchController();
        this.router = Router();
        this.initializeBranchRoutes();
    }

    public initializeBranchRoutes(){
        this.router.post("/create-branch", requireAuth, this.controller.createBranch.bind(this.controller));
        this.router.get("/get-branches", requireAuth, this.controller.getBranches.bind(this.controller));
        this.router.delete("/delete-branch", requireAuth, this.controller.deleteBranch.bind(this.controller));
        this.router.put("/update-branch", requireAuth, this.controller.updateBranch.bind(this.controller))
    }
}