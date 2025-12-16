import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { UserRoutes } from "../routes/UserRoutes.js";
import { AuthRoutes } from "../routes/AuthRoutes.js";
import { globalErrorHandler } from "../middlewares/errorHandling.js";
import { PermissionRoutes } from "../routes/PermissionRoutes.js";
import { RoleRoutes } from "../routes/RoleRoutes.js";
import { RoleDataScopeRoutes } from "../routes/RoleDataScopeRoutes.js";
import { BranchRoutes } from "../routes/BranchRoutes.js";
import { AppProfileSettingsRoutes } from "../routes/AppProfileSettingsRoutes.js";
import { CategoryRoutes } from "../routes/CategoryRoutes.js";
import { ProductRoutes } from "../routes/ProductRoutes.js";
import { SupplierRoutes } from "../routes/SupplierRoutes.js";
import { PurchaseRoutes } from "../routes/PurchaseRoutes.js";
import { CustomerRoutes } from "../routes/CustomerRoutes.js";
import { SaleRoutes } from "../routes/SaleRoutes.js";
import { ExpenseRoutes } from "../routes/ExpenseRoutes.js";
import { PaymentRoutes } from "../routes/PaymentRoutes.js";
import { StockAdjustmentRoutes } from "../routes/StockAdjustmentRoutes.js";
// import { sequelize } from "../config/database";

dotenv.config();

export class App {
  public app: Application;
  private authRoutes: AuthRoutes;
  private userRoutes: UserRoutes;
  private permissionRoutes: PermissionRoutes;
  private branchRoutes: BranchRoutes;
  private appProfileSettinsRoutes: AppProfileSettingsRoutes;
  private roleRoutes: RoleRoutes;
  private categoryRoutes: CategoryRoutes;
  private roleDataScopeRoutes: RoleDataScopeRoutes;
  private productRoutes: ProductRoutes;
  private supplierRoutes: SupplierRoutes;
  private purchaseRoutes: PurchaseRoutes;
  private customerRoutes: CustomerRoutes;
  private saleRoutes: SaleRoutes;
  private expenseRoutes: ExpenseRoutes;
  private paymentRoutes: PaymentRoutes;
  private stockAdjustmentRoutes: StockAdjustmentRoutes;
  constructor() {
    this.app = express();

    this.middlewares();
    this.authRoutes = new AuthRoutes();
    this.userRoutes = new UserRoutes();
    this.roleRoutes = new RoleRoutes();
    this.branchRoutes = new BranchRoutes();
    this.appProfileSettinsRoutes = new AppProfileSettingsRoutes();

    this.permissionRoutes = new PermissionRoutes();
    this.roleDataScopeRoutes = new RoleDataScopeRoutes();
    this.categoryRoutes = new CategoryRoutes();
    this.productRoutes = new ProductRoutes();
    this.supplierRoutes = new SupplierRoutes();
    this.purchaseRoutes = new PurchaseRoutes();
    this.customerRoutes = new CustomerRoutes();
    this.saleRoutes = new SaleRoutes();
    this.expenseRoutes = new ExpenseRoutes();
    this.paymentRoutes = new PaymentRoutes();
    this.stockAdjustmentRoutes = new StockAdjustmentRoutes();
    this.routes();
    // this.database();
    this.setupErrorHandling();
  }

  private middlewares() {
    this.app.use(
      cors({ origin: ["http://localhost:5175"], credentials: true })
    );
    this.app.use(helmet());
    this.app.use(morgan("dev"));

    this.app.use(express.json({ limit: "50mb" }));
  }

  private routes() {
    // this.app.use("/api", routes);
    this.app.use("/api/auth", this.authRoutes.router);
    this.app.use("/api/users", this.userRoutes.router);
    this.app.use("/api/permissions", this.permissionRoutes.router);
    this.app.use("/api/roles", this.roleRoutes.router);
    this.app.use("/api/role-data-scope", this.roleDataScopeRoutes.router);
    this.app.use("/api/branches", this.branchRoutes.router);
    this.app.use("/api/categories", this.categoryRoutes.router);
    this.app.use("/api/profile-settings", this.appProfileSettinsRoutes.router);
    this.app.use("/api/products", this.productRoutes.router);
    this.app.use("/api/suppliers", this.supplierRoutes.router);
    this.app.use("/api/purchases", this.purchaseRoutes.router);
    this.app.use("/api/customers", this.customerRoutes.router);
    this.app.use("/api/sales", this.saleRoutes.router);
    this.app.use("/api/expenses", this.expenseRoutes.router);
    this.app.use("/api/payments", this.paymentRoutes.router);
    this.app.use("/api/stock-adjustments", this.stockAdjustmentRoutes.router);
  }
  private setupErrorHandling() {
    this.app.use(globalErrorHandler);
  }
}
