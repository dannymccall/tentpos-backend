import { UserController } from "../controllers/UserController.js";
import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { roleDataScopeMiddleware } from "../middlewares/roleDataScopeMiddleware.js";
import { verifyTentHubToken } from "../middlewares/verifyTentHubtoken.js";
import { requireActiveSubscription } from "../middlewares/requireActiveSubscription.js";

export class UserRoutes {
  private controller: UserController;
  public router: Router;

  constructor() {
    this.controller = new UserController();
    this.router = Router();
    this.initializeUserRoutes();
  }

  private initializeUserRoutes() {
    this.router.get(
      "/get-users",
      requireAuth,
      roleDataScopeMiddleware,
      this.controller.getUsers.bind(this.controller)
    );
    this.router.put(
      "/update-user",
      requireAuth,
      requireActiveSubscription(),

      this.controller.updateUser.bind(this.controller)
    );
    this.router.post(
      "/add-user",
      verifyTentHubToken,
      this.controller.addUser.bind(this.controller)
    );

    this.router.get(
      "/user",
      requireAuth,
      this.controller.getStaffDetails.bind(this.controller)
    );
  }
}
