import { Router } from "express";
import saleController from "../controllers/SaleController.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { RequirePermission } from "../middlewares/Requirepermission.js";
import { roleDataScopeMiddleware } from "../middlewares/roleDataScopeMiddleware.js";

export class SaleRoutes {
  private controller: typeof saleController;
  public router: Router;

  constructor() {
    this.controller = saleController;
    this.router = Router();
    this.initializeSaleRoutes();
  }
  private initializeSaleRoutes() {
    this.router.post(
      "/",
      requireAuth,
      RequirePermission("sales.create"),
      this.controller.create.bind(this.controller)
    );
    this.router.get(
      "/",
      requireAuth,
      RequirePermission("sales.view"),
      roleDataScopeMiddleware,
      this.controller.list.bind(this.controller)
    );
    this.router.get(
      "/get",
      requireAuth,
      RequirePermission("sales.view"),
      this.controller.get.bind(this.controller)
    );
    this.router.put(
      "/cancel",
      requireAuth,
      RequirePermission("sales.cancel"),
      this.controller.cancel.bind(this.controller)
    );
    this.router.get(
      "/invoices",
      requireAuth,
      RequirePermission("sales.cancel"),
      roleDataScopeMiddleware,
      this.controller.getInvoices.bind(this.controller)
    );
    this.router.get(
      "/returns",
      requireAuth,
      RequirePermission("sales.view"),
      roleDataScopeMiddleware,
      this.controller.getSaleReturns.bind(this.controller)
    );

    this.router.post(
      "/return",
      requireAuth,
      RequirePermission("sales.view"),
      this.controller.processReturnSale.bind(this.controller)
    );
    this.router.post(
      "/complete-hold-sale",
      requireAuth,
      RequirePermission("sales.view"),
      this.controller.completeHoldSale
      .bind(this.controller)
    );
  }
}
