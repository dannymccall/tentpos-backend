import { ReportController } from "../controllers/ReportController.js";
import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { RequirePermission } from "../middlewares/Requirepermission.js";
import { requireActiveSubscription } from "../middlewares/requireActiveSubscription.js";

export class ReportRoutes {
  private controller: ReportController;
  public router: Router;

  constructor() {
    this.controller = new ReportController();
    this.router = Router();
    this.initializeReportRoutes();
  }

  private initializeReportRoutes() {
    this.router.post(
      "/sales",
      requireAuth,
      RequirePermission(""),
      requireActiveSubscription(),

      this.controller.getSalesReport.bind(this.controller),
    );
    this.router.post(
      "/inventory",
      requireAuth,
      RequirePermission(""),
      requireActiveSubscription(),

      this.controller.getInventoryReport.bind(this.controller),
    );
    this.router.post(
      "/purchases",
      requireAuth,
      RequirePermission(""),
      requireActiveSubscription(),

      this.controller.getPurchasesReport.bind(this.controller),
    );
  }
}
