import { SupplierController } from "../controllers/SupplierController.js";

import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { RequirePermission } from "../middlewares/Requirepermission.js";
import { roleDataScopeMiddleware } from "../middlewares/roleDataScopeMiddleware.js";

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
      this.controller.update.bind(this.controller)
    );
    this.router.delete(
      "/delete",
      requireAuth,
      RequirePermission("suppliers.delete"),
      this.controller.remove.bind(this.controller)
    );

     this.router.post(
      "/bulk-upload",
      requireAuth,
      RequirePermission("suppliers.create"),
      this.controller.bulkUpload.bind(this.controller)
    );
  }
}
