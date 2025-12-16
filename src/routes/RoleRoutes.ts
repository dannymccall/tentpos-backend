import { RoleController } from "../controllers/RoleController.js";
import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";

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
      this.controller.deleteRole.bind(this.controller)
    );
    this.router.put(
      "/update-role",
      requireAuth,
      this.controller.updateRole.bind(this.controller)
    );
  }
}
