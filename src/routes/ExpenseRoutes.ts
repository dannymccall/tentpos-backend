// src/routes/ExpenseRoutes.ts
import { Router } from "express";
import { ExpenseController } from "../controllers/ExpenseController.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { roleDataScopeMiddleware } from "../middlewares/roleDataScopeMiddleware.js";
import { requireActiveSubscription } from "../middlewares/requireActiveSubscription.js";

export class ExpenseRoutes {
  public router: Router;
  private controller: ExpenseController;

  constructor() {
    this.router = Router();
    this.controller = new ExpenseController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      "/create",
      requireAuth,
            requireActiveSubscription(),
      
      this.controller.createExpense.bind(this.controller)
    );

    this.router.get(
      "/",
      requireAuth,
      roleDataScopeMiddleware,
      this.controller.getExpenses.bind(this.controller)
    );

    this.router.get(
      "/:id",
      requireAuth,
      this.controller.getExpense.bind(this.controller)
    );

    this.router.put(
      "/update",
      requireAuth,
            requireActiveSubscription(),

      this.controller.updateExpense.bind(this.controller)
    );

    this.router.delete(
      "/delete",
      requireAuth,
            requireActiveSubscription(),

      this.controller.deleteExpense.bind(this.controller)
    );
  }
}
