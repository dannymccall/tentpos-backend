import { Session, initSession } from "../models/Session.js";
import { User, initUserModel } from "../models/User.js";
import sequelize from "./database.js";
import { UserRole, initUserRoleModel } from "../models/UserRoles.js";
import { Role, initRoleModel } from "../models/Role.js";
import {
  RolePermission,
  initRolePermissionModel,
} from "../models/Permissions.js";
import { Branch, initBranch } from "../models/Branch.js";
import { initAppProfileSettings } from "../models/AppProfileSettings.js";
import {
  RoleDataScope,
  initRoleDataScopeModel,
} from "../models/RoleDataScope.js";
import { Category, initCategoryModel } from "../models/Category.js";

import Product, { initProductModel } from "../models/Product.js";
import ProductImage, { initProductImageModel } from "../models/ProductImage.js";
import ProductVariant, {
  initProductVariantModel,
} from "../models/ProductVariant.js";
import { initSupplierModel, Supplier } from "../models/Supplier.js";
import { initPurchaseModel, Purchase } from "../models/Purchase.js";
import { PurchaseItem, initPurchaseItemModel } from "../models/PurchaseItem.js";
import { Customer, initCustomerModel } from "../models/Customer.js";
import { initSaleItemModel, SaleItem } from "../models/SaleItem.js";
import { initSaleModel, Sale } from "../models/Sale.js";
import { initInvoiceModel, Invoice } from "../models/Invoice.js";
import {
  initProductBranchModel,
  ProductBranch,
} from "../models/ProductBranch.js";
import { Expense, initExpense } from "../models/Expenses.js";
import Payment, { initPaymentModel } from "../models/Payment.js";
import Debtor, { initDebotorsModel } from "../models/Debtos.js";
import StockAdjustment, {
  initStockAdjustmentModel,
} from "../models/StockAdjustment.js";
import { SaleReturn, initSaleReturnModel } from "../models/SaleReturn.js";
import {
  initSaleReturnItem,
  SaleReturnItem,
} from "../models/SaleReturnItems.js";
initSession(sequelize);
initRoleModel(sequelize);
initBranch(sequelize);

initUserModel(sequelize);
initUserRoleModel(sequelize);
initRolePermissionModel(sequelize);
initAppProfileSettings(sequelize);
initRoleDataScopeModel(sequelize);
initCategoryModel(sequelize);
initProductModel(sequelize);
initProductImageModel(sequelize);
initProductVariantModel(sequelize);
initSupplierModel(sequelize);
initPurchaseModel(sequelize);
initPurchaseItemModel(sequelize);
initCustomerModel(sequelize);
initSaleModel(sequelize);
initSaleItemModel(sequelize);
initInvoiceModel(sequelize);
initProductBranchModel(sequelize);
initExpense(sequelize);
initPaymentModel(sequelize);
initDebotorsModel(sequelize);
initStockAdjustmentModel(sequelize);
initSaleReturnModel(sequelize);
initSaleReturnItem(sequelize);
Branch.hasMany(User, {
  foreignKey: "branchId",
  as: "users",
  onDelete: "CASCADE",
});

// Each user belongs to a single branch
User.belongsTo(Branch, {
  foreignKey: "branchId",
  as: "branch",
  onDelete: "CASCADE",
});

User.hasOne(UserRole, {
  foreignKey: "userId",
  as: "userRole",
  onDelete: "CASCADE",
});
UserRole.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
  onDelete: "CASCADE",
});

UserRole.belongsTo(Role, {
  foreignKey: "roleId",
  as: "role",
  onDelete: "CASCADE",
});
Role.hasMany(UserRole, {
  foreignKey: "roleId",
  as: "userRoles",
  onDelete: "CASCADE",
});

Product.hasMany(ProductBranch, { foreignKey: "productId", as: "branches" });
ProductBranch.belongsTo(Product, { foreignKey: "productId", as: "product" });

Branch.hasMany(ProductBranch, { foreignKey: "branchId", as: "products" });
ProductBranch.belongsTo(Branch, { foreignKey: "branchId", as: "branch" });

Category.hasMany(Product, {
  foreignKey: "categoryId",
  as: "productCategories",
});
Product.belongsTo(Category, {
  foreignKey: "categoryId",
  as: "categoryProduct",
});
Product.hasMany(ProductVariant, {
  as: "variants",
  foreignKey: "productId",
  onDelete: "CASCADE",
});
ProductVariant.belongsTo(Product, { foreignKey: "productId" });
Product.hasMany(ProductImage, {
  as: "images",
  foreignKey: "productId",
  onDelete: "CASCADE",
});
ProductImage.belongsTo(Product, { foreignKey: "productId" });

Branch.hasMany(ProductBranch, { foreignKey: "branchId", as: "branchProducts" });
ProductBranch.belongsTo(Branch, { foreignKey: "branchId", as: "branchInfo" });

Purchase.hasMany(PurchaseItem, {
  foreignKey: "purchaseId",
  as: "items",
  onDelete: "CASCADE",
});
PurchaseItem.belongsTo(Purchase, { foreignKey: "purchaseId", as: "purchase" });

Supplier.hasMany(Purchase, {
  foreignKey: "supplierId",
  as: "supplierPurchases",
});
Purchase.belongsTo(Supplier, { foreignKey: "supplierId", as: "supplier" });

Branch.hasMany(Customer, {
  foreignKey: "branchId",
  as: "branchCustomers",
  onDelete: "CASCADE",
});
Customer.belongsTo(Branch, { foreignKey: "branchId", as: "branchCustomer" });

Sale.hasOne(Invoice, { foreignKey: "saleId", as: "invoice" });
Invoice.belongsTo(Sale, { foreignKey: "saleId", as: "saleInvoice" });

Branch.hasMany(Invoice, { foreignKey: "branchId", as: "branchInvoices" });
Invoice.belongsTo(Branch, { foreignKey: "branchId", as: "branchInvoice" });
Branch.hasMany(Sale, { foreignKey: "branchId", as: "branchSales" });
Sale.belongsTo(Branch, { foreignKey: "branchId", as: "branchSale" });

Customer.hasMany(Sale, { foreignKey: "customerId", as: "customerSales" });
Sale.belongsTo(Customer, { foreignKey: "customerId", as: "customer" });

Sale.hasMany(SaleItem, { foreignKey: "saleId", as: "saleItems" });
SaleItem.belongsTo(Sale, { foreignKey: "saleId", as: "sale" });

User.hasMany(Sale, { foreignKey: "userId", as: "userSales" });
Sale.belongsTo(User, { foreignKey: "userId", as: "userSale" });

Branch.hasMany(Expense, { foreignKey: "branchId", as: "branchExpenses" });
Expense.belongsTo(Branch, { foreignKey: "branchId", as: "branchExpense" });

Product.hasMany(SaleItem, { foreignKey: "productId", as: "productSaleItems" });
SaleItem.belongsTo(Product, { foreignKey: "productId", as: "product" });

Sale.hasMany(Payment, { foreignKey: "saleId", as: "payments" });
Payment.belongsTo(Sale, { foreignKey: "saleId", as: "salePayment" });

Customer.hasOne(Debtor, { foreignKey: "customerId", as: "debtorInfo" });
Debtor.belongsTo(Customer, { foreignKey: "customerId", as: "customerDebtor" });

Branch.hasMany(Debtor, { foreignKey: "branchId", as: "branchDebtors" });
Debtor.belongsTo(Branch, { foreignKey: "branchId", as: "branchDebtor" });

Branch.hasMany(Payment, { foreignKey: "branchId", as: "branchPayments" });
Payment.belongsTo(Branch, { foreignKey: "branchId", as: "branchPayment" });

Customer.hasMany(Payment, {foreignKey: "customerId", as:"customerPayments"});
Payment.belongsTo(Customer, {foreignKey: "customerId", as:"customerPayment"})
User.hasMany(Payment, { foreignKey: "userId", as: "userPayments" });
Payment.belongsTo(User, { foreignKey: "userId", as: "userPayment" });

Branch.hasMany(StockAdjustment, {
  foreignKey: "branchId",
  as: "branchStockAdjustments",
});
StockAdjustment.belongsTo(Branch, {
  foreignKey: "branchId",
  as: "branchStockAdjustment",
});

Product.hasMany(StockAdjustment, {
  foreignKey: "productId",
  as: "productStockAdjustments",
});
StockAdjustment.belongsTo(Product, {
  foreignKey: "productId",
  as: "productStockAdjustment",
});

User.hasMany(StockAdjustment, {
  foreignKey: "userId",
  as: "userStockAdjustments",
});
StockAdjustment.belongsTo(User, {
  foreignKey: "userId",
  as: "userStockAdjustment",
});

Sale.hasMany(SaleReturn, {
  foreignKey: "saleId",
  as: "returns",
});

SaleReturn.belongsTo(Sale, {
  foreignKey: "saleId",
  as: "sale",
});
SaleReturn.hasMany(SaleReturnItem, {
  foreignKey: "saleReturnId",
  as: "items",
});

SaleReturnItem.belongsTo(SaleReturn, {
  foreignKey: "saleReturnId",
  as: "return",
});

SaleReturnItem.belongsTo(SaleItem, {
  foreignKey: "saleItemId",
  as: "saleItem",
});
SaleReturnItem.belongsTo(Product, {
  foreignKey: "productId",
  as: "productItem",
});
Branch.hasMany(SaleReturn, {
  foreignKey: "branchId",
  as: "branchReturns",
});

SaleReturn.belongsTo(Branch, {
  foreignKey: "branchId",
  as: "branchReturn",
});
User.hasMany(SaleReturn, {
  foreignKey: "userId",
  as: "processedReturns",
});

SaleReturn.belongsTo(User, {
  foreignKey: "userId",
  as: "processedBy",
});

export {
  sequelize,
  Session,
  User,
  UserRole,
  Role,
  RolePermission,
  Branch,
  RoleDataScope,
  Category,
  Product,
  ProductImage,
  ProductVariant,
  Supplier,
  Purchase,
  PurchaseItem,
  Customer,
  Sale,
  SaleItem,
  Invoice,
  ProductBranch,
  Expense,
  Payment,
  Debtor,
  StockAdjustment,
  SaleReturn,
  SaleReturnItem
};
