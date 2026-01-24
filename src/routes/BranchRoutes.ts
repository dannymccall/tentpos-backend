import { BranchController } from "../controllers/BranchController.js";
import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { roleDataScopeMiddleware } from "../middlewares/roleDataScopeMiddleware.js";
import { requireActiveSubscription } from "../middlewares/requireActiveSubscription.js";
export class BranchRoutes {
  private controller: BranchController;
  public router: Router;

  constructor() {
    this.controller = new BranchController();
    this.router = Router();
    this.initializeBranchRoutes();
  }

  public initializeBranchRoutes() {
    this.router.post(
      "/create-branch",
      requireAuth,
      requireActiveSubscription(),

      this.controller.createBranch.bind(this.controller)
    );
    this.router.get(
      "/get-branches",
      requireAuth,
      roleDataScopeMiddleware,
      this.controller.getBranches.bind(this.controller)
    );
    this.router.delete(
      "/delete-branch",
      requireAuth,
      requireActiveSubscription(),

      this.controller.deleteBranch.bind(this.controller)
    );
    this.router.put(
      "/update-branch",
      requireAuth,
      requireActiveSubscription(),

      this.controller.updateBranch.bind(this.controller)
    );
  }
}
