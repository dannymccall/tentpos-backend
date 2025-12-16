import { ProductController } from "../controllers/ProductController.js";
import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { RequirePermission } from "../middlewares/Requirepermission.js";
import multer from "multer";
import { roleDataScopeMiddleware } from "../middlewares/roleDataScopeMiddleware.js";

const uploaded = multer({ dest: "uploads/loan-attachments" });

export class ProductRoutes {
  private controller: ProductController;
  public router: Router;

  constructor() {
    this.controller = new ProductController();
    this.router = Router();
    this.initProductRoutes();
  }

  private initProductRoutes() {
    this.router.post(
      "/",
      requireAuth,
      RequirePermission("inventory.products.create"),
      uploaded.array("images", 5),
      this.controller.create.bind(this.controller)
    );
    this.router.put(
      "/update-product",
      requireAuth,
      RequirePermission("inventory.products.update"),
      uploaded.array("images", 5),
      this.controller.update.bind(this.controller)
    );
    this.router.get(
      "/get-products",
      requireAuth,
      RequirePermission("inventory.products.view"),
      roleDataScopeMiddleware,
      this.controller.list.bind(this.controller)
    );

    this.router.get(
      "/get-product",
      requireAuth,
      RequirePermission("inventory.products.view"),
      roleDataScopeMiddleware,
      this.controller.getOne.bind(this.controller)
    );
    this.router.delete(
      "/delete-product",
      requireAuth,
      RequirePermission("inventory.products.delete"),
      this.controller.remove.bind(this.controller)
    );
    this.router.post(
      "/bulk-upload",
      requireAuth,
      RequirePermission("inventory.products.create"),
      this.controller.bulkUpload.bind(this.controller)
    );

    this.router.get("/fetch-sale-products",
      requireAuth,
      RequirePermission("inventory.products.view"),
      this.controller.fetchSaleProducts.bind(this.controller)
    );

    this.router.get("/fetch-low-stock-products",
      requireAuth,
      RequirePermission("inventory.products.view"),
      this.controller.fetchLowStockProducts.bind(this.controller)
    );
  }
}
