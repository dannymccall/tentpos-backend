import { DashboardController } from "../controllers/DashboardController.js";
import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { roleDataScopeMiddleware } from "../middlewares/roleDataScopeMiddleware.js";

export class DashboardRoutes {
  private controller: DashboardController;
  public router: Router;

  constructor() {
    this.controller = new DashboardController();
    this.router = Router();
    this.initDashboardRoutes()
  }

  private initDashboardRoutes() {
    this.router.get(
      "/",
      requireAuth,
      roleDataScopeMiddleware,
      this.controller.getDashboardData.bind(this.controller)
    );
    this.router.get(
      "/daily-summary",
      requireAuth,
      roleDataScopeMiddleware,
      this.controller.getDailySummary.bind(this.controller)
    );
  }
}
