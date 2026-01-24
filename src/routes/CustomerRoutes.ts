import customerController from "../controllers/CustomerController.js";
import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { RequirePermission } from "../middlewares/Requirepermission.js";
import { roleDataScopeMiddleware } from "../middlewares/roleDataScopeMiddleware.js";
import { requireActiveSubscription } from "../middlewares/requireActiveSubscription.js";

export class CustomerRoutes {
  private controller: typeof customerController;
  public router: Router;

  constructor() {
    this.controller = customerController;
    this.router = Router();
    this.initializeCustomerRouters();
  }

  private initializeCustomerRouters() {
    this.router.post(
      "/",
      requireAuth,
      RequirePermission("customers.create"),
            requireActiveSubscription(),
      
      this.controller.create.bind(this.controller)
    );
    this.router.post(
      "/bulk-upload",
      requireAuth,
      RequirePermission("customers.create"),
            requireActiveSubscription(),

      this.controller.bulkUpload.bind(this.controller)
    );
    this.router.get(
      "/",
      requireAuth,
      RequirePermission("customers.view"),
      roleDataScopeMiddleware,
      this.controller.list.bind(this.controller)
    );
    this.router.get(
      "/debtors",
      requireAuth,
      RequirePermission("customers.view"),
      roleDataScopeMiddleware,
      this.controller.debtors.bind(this.controller)
    );
    this.router.get(
      "/get",
      requireAuth,
      RequirePermission("customers.view"),
      this.controller.get.bind(this.controller)
    );
    this.router.put(
      "/update",
      requireAuth,
      RequirePermission("customers.update"),
            requireActiveSubscription(),

      this.controller.update.bind(this.controller)
    );
    this.router.delete(
      "/delete",
      requireAuth,
      RequirePermission("customers.delete"),
            requireActiveSubscription(),

      this.controller.delete.bind(this.controller)
    );
  }
}
