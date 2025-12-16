import { PermissionController } from "../controllers/PermissionController.js";
import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";

export class PermissionRoutes {
  private controller: PermissionController;
  public router: Router;

  constructor() {
    this.controller = new PermissionController();
    this.router = Router();
    this.initializePermissionRoutes();
  }

  public initializePermissionRoutes() {
    this.router.post(
      "/add-permission",
      requireAuth,
      this.controller.addNewPermission.bind(this.controller)
    );
    this.router.get(
      "/get-permissions",
      requireAuth,
      this.controller.getPermissions.bind(this.controller)
    );
    this.router.get(
      "/get-permission",
      requireAuth,
      this.controller.getPermission.bind(this.controller)
    );
  }
}
