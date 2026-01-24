import { SupplierController } from "../controllers/SupplierController.js";

import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { RequirePermission } from "../middlewares/Requirepermission.js";
import { roleDataScopeMiddleware } from "../middlewares/roleDataScopeMiddleware.js";
import { requireActiveSubscription } from "../middlewares/requireActiveSubscription.js";

export class SupplierRoutes {
  private controller: SupplierController;

  public router: Router;

  constructor() {
    this.controller = new SupplierController();
    this.router = Router();
    this.initializeSupplierRouter();
  }

  private initializeSupplierRouter() {
    this.router.post(
      "/",
      requireAuth,
      RequirePermission("suppliers.create"),
      requireActiveSubscription(),

      this.controller.create.bind(this.controller)
    );
    this.router.get(
      "/",
      requireAuth,
      RequirePermission("suppliers.view"),
      roleDataScopeMiddleware,
      this.controller.list.bind(this.controller)
    );
    this.router.get(
      "/get-supplier",
      requireAuth,
      RequirePermission("suppliers.view"),
      this.controller.get.bind(this.controller)
    );
    this.router.put(
      "/update",
      requireAuth,
      RequirePermission("suppliers.update"),
      requireActiveSubscription(),

      this.controller.update.bind(this.controller)
    );
    this.router.delete(
      "/delete",
      requireAuth,
      RequirePermission("suppliers.delete"),
      requireActiveSubscription(),

      this.controller.remove.bind(this.controller)
    );

    this.router.post(
      "/bulk-upload",
      requireAuth,
      RequirePermission("suppliers.create"),
      requireActiveSubscription(),

      this.controller.bulkUpload.bind(this.controller)
    );
  }
}
