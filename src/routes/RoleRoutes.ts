import { RoleController } from "../controllers/RoleController.js";
import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { requireActiveSubscription } from "../middlewares/requireActiveSubscription.js";

export class RoleRoutes {
  private controller: RoleController;
  public router: Router;

  constructor() {
    this.controller = new RoleController();
    this.router = Router();
    this.initializeRoleRoutes();
  }

  private initializeRoleRoutes() {
    this.router.post(
      "/add-role",
      requireAuth,
            requireActiveSubscription(),
      
      this.controller.addNewRole.bind(this.controller)
    );
    this.router.get(
      "/get-roles",
      requireAuth,
      this.controller.getRoles.bind(this.controller)
    );
    this.router.get(
      "/get-role",
      requireAuth,
      this.controller.getRole.bind(this.controller)
    );
    this.router.delete(
      "/delete-role",
      requireAuth,
            requireActiveSubscription(),

      this.controller.deleteRole.bind(this.controller)
    );
    this.router.put(
      "/update-role",
      requireAuth,
            requireActiveSubscription(),

      this.controller.updateRole.bind(this.controller)
    );
  }
}
