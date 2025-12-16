import { StockAdjustmentController } from "../controllers/StockAdjustmentController.js";
import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { RequirePermission } from "../middlewares/Requirepermission.js";
import { roleDataScopeMiddleware } from "../middlewares/roleDataScopeMiddleware.js";

export class StockAdjustmentRoutes {
  public router: Router;
  private controller: StockAdjustmentController;

  constructor() {
    this.router = Router();
    this.controller = new StockAdjustmentController();
    this.routes();
  }
  private routes() {
    this.router.post(
      "/adjust",
      requireAuth,
      RequirePermission(""),
      this.controller.adjustStock.bind(this.controller)
    );
    this.router.get(
      "/adjustments",
      requireAuth,
      RequirePermission(""),
      roleDataScopeMiddleware,
      this.controller.listAdjustments.bind(this.controller)
    );
  }
}
