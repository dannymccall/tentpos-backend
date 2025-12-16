import { Router } from "express";
import { CategoryController } from "../controllers/CategoryController.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { roleDataScopeMiddleware } from "../middlewares/roleDataScopeMiddleware.js";
import { RequirePermission } from "../middlewares/Requirepermission.js";
export class CategoryRoutes {
  public router: Router;
  private controller: CategoryController;

  constructor() {
    this.router = Router();
    this.controller = new CategoryController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      "/get-categories",
      requireAuth,
      roleDataScopeMiddleware,
      this.controller.getCategories.bind(this.controller)
    );

    this.router.get(
      "/get-category",
      requireAuth,
      this.controller.getCategory.bind(this.controller)
    );

    this.router.post(
      "/add-category",
      requireAuth,
      RequirePermission("inventory.categories.create"),
      this.controller.addCategory.bind(this.controller)
    );
    this.router.post(
      "/bulk-upload",
      requireAuth,
      RequirePermission("inventory.categories.create"),
      this.controller.bulkUploadCategory.bind(this.controller)
    );

    this.router.put(
      "/update-category",
      requireAuth,
      RequirePermission("inventory.categories.update"),
      this.controller.updateCategory.bind(this.controller)
    );

    this.router.delete(
      "/delete-category",
      requireAuth,
      RequirePermission("inventory.categories.delete"),
      this.controller.deleteCategory.bind(this.controller)
    );
  }
}
