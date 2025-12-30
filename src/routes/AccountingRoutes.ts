import { AccountingController } from "../controllers/AccountingController.js";
import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { RequirePermission } from "../middlewares/Requirepermission.js";

export class AccountingRoutes {
  private controller: AccountingController;
  public router: Router;

  constructor() {
    this.controller = new AccountingController();
    this.router = Router();
    this.initializeAccountingRoutes()
  }

  private initializeAccountingRoutes() {
    this.router.post(
      "/income-statement",
      requireAuth,
      RequirePermission(""),
      this.controller.getIncomeStatement.bind(this.controller)
    );
    this.router.post(
      "/profit",
      requireAuth,
      RequirePermission(""),
      this.controller.getProfitReport.bind(this.controller)
    );
    this.router.post(
      "/cash-flow",
      requireAuth,
      RequirePermission(""),
      this.controller.getCashflows.bind(this.controller)
    );
  }
}
