import { Router } from "express";
import PurchaseController from "../controllers/PurchaseController.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { RequirePermission } from "../middlewares/Requirepermission.js";
import { roleDataScopeMiddleware } from "../middlewares/roleDataScopeMiddleware.js";
import { requireActiveSubscription } from "../middlewares/requireActiveSubscription.js";

export class PurchaseRoutes {
  private controller: typeof PurchaseController;
  public router: Router;
  constructor() {
    this.controller = PurchaseController;
    this.router = Router();
    this.initializePurchaseRoutes();
  }

  public initializePurchaseRoutes() {
    this.router.post(
      "/",
      requireAuth,
      RequirePermission("purchase.create"),
            requireActiveSubscription(),
      
      this.controller.create.bind(this.controller)
    );
    this.router.get(
      "/",
      requireAuth,
      RequirePermission("purcahse.view"),
      roleDataScopeMiddleware,
      this.controller.list.bind(this.controller)
    );
    this.router.get(
      "/get-purchase",
      requireAuth,
      RequirePermission("purchase.view"),
      this.controller.get.bind(this.controller)
    );
    this.router.put(
      "/update",
      requireAuth,
      RequirePermission("purchase.view"),
            requireActiveSubscription(),

      this.controller.update.bind(this.controller)
    );
    this.router.delete(
      "/delete",
      requireAuth,
      RequirePermission("purchase.delete"),
            requireActiveSubscription(),

      this.controller.remove.bind(this.controller)
    );
  }
}
