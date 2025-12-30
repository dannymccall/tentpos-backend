import { ProductBranch } from "../../models/ProductBranch.js";
import Product from "../../models/Product.js";
import { Branch } from "../../models/Branch.js";
import StockAdjustment from "../../models/StockAdjustment.js";
import { InventoryFilters } from "../../types.js";
import { Op } from "sequelize";
import { User } from "../../models/User.js";
import { Category } from "../../models/Category.js";
import sequelize from "../../config/database.js";

class InventoryReportService {
  private buildFilter = (filters: InventoryFilters) => {
    const { startDate, endDate, branchId, categoryId, tenantId, productId } =
      filters;

    const reportFilter: any = { tenantId };

    if (startDate || endDate) {
      reportFilter.createdAt = {};
      if (startDate)
        reportFilter.createdAt[Op.gte] = new Date(startDate).setHours(
          0,
          0,
          0,
          0
        );
      if (endDate)
        reportFilter.createdAt[Op.lte] = new Date(endDate).setHours(
          23,
          59,
          59,
          999
        );
    }

    if (branchId && typeof branchId !== "string") {
      Object.assign(reportFilter, { branchId });
    }

    if (productId) {
      // dynamically map to the right column

      Object.assign(reportFilter, {
        [Op.or]: [{ id: productId }, { productId }],
      }); // Loan table uses userId
    }

    return reportFilter;
  };

  private buildProductWhere = (filters: InventoryFilters) => {
    const where = {};
    if (filters.productId) {
      Object.assign(where, { id: filters.productId });
    }

    if (filters.categoryId) {
      Object.assign(where, { categoryId: filters.categoryId });
    }

    return where;
  };

  public reportHandler = async (filters: InventoryFilters) => {
    if (filters.status === "SUMMARY") {
      const report = await this.getStockSummaryReport(filters);
      return report;
    }

    switch (filters.status) {
      case "ADJUSTMENT":
        return await this.getStockAdjustmentReport(filters);
      case "LOW_STOCK":
        return await this.getLowStock(filters);
      case "VALUATION":
        return await this.getStockValuationReport(filters);
      default:
        return null;
    }
  };

  private async getStockSummaryReport(filters: InventoryFilters) {
    const reportFilter = this.buildFilter(filters);
    console.log({ reportFilter });
    const productWhere = this.buildProductWhere(filters);

    const rows = await ProductBranch.findAll({
      where: { ...reportFilter },
      include: [
        {
          model: Product,
          as: "product",
          where: { ...productWhere },
          include: [{ model: Category, as: "categoryProduct" }],
          attributes: [
            "id",
            "title",
            "sku",
            "cost",
            "threshold",
            "trackInventory",
          ],
        },
        {
          model: Branch,
          as: "branch",
          attributes: ["id", "name"],
        },
      ],
      order: [["inventory", "ASC"]],
    });

    let report = rows.map((row) => {
      const product = row.product!;
      const threshold = row.reorderLevel ?? product.threshold ?? 0;

      const currentQty = row.inventory;

      let stockStatus: "OK" | "LOW" | "OUT" = "OK";
      if (currentQty <= 0) stockStatus = "OUT";
      else if (currentQty <= threshold) stockStatus = "LOW";

      return {
        productId: product.id,
        productTitle: product.title,
        sku: product.sku,

        branchId: row.branchId,
        branchName: row.branch!.name,

        currentQty,
        reorderLevel: row.reorderLevel ?? threshold,
        productThreshold: product.threshold ?? 0,

        stockStatus,
        category: row.product?.categoryProduct.name,

        unitCost: product.cost ?? 0,
        stockValue: currentQty * (product.cost ?? 0),

        trackInventory: product.trackInventory ?? true,
      };
    });

    //   if (filters.lowStock) {
    //     report = report.filter(
    //       (r) => r.stockStatus === "LOW" || r.stockStatus === "OUT"
    //     );
    //   }

    return report;
  }

  private async getStockAdjustmentReport(filters: InventoryFilters) {
    const where: any = {
      tenantId: filters.tenantId,
    };

    if (filters.startDate && filters.endDate) {
      where.createdAt = {
        [Op.between]: [filters.startDate, filters.endDate],
      };
    }

    const productWhere = this.buildProductWhere(filters);

    const rows = await StockAdjustment.findAll({
      where,
      include: [
        {
          model: Product,
          as: "productStockAdjustment",
          attributes: ["id", "title", "sku"],
          where: { ...productWhere },
          include: [{ model: Category, as: "categoryProduct" }],
        },
        {
          model: Branch,
          attributes: ["id", "name"],
          as: "branchStockAdjustment",
        },
        {
          model: User,
          attributes: ["id", "fullName"],
          as: "userStockAdjustment",
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return rows.map((row) => ({
      id: row.id,
      date: row.createdAt?.toISOString(),

      productId: row.productId,
      productTitle: row.productStockAdjustment!.title,
      sku: row.productStockAdjustment!.sku,

      branchId: row.branchId,
      branchName: row.branchStockAdjustment!.name,

      qtyChange: row.qtyChange,
      direction: row.qtyChange > 0 ? "IN" : "OUT",
      category: row.productStockAdjustment?.categoryProduct.name,
      reason: row.reason,
      note: row.note,

      adjustedBy: row.userStockAdjustment!.fullName,
    }));
  }

  private async getLowStock(filters: InventoryFilters) {
    const reportFilter = this.buildFilter(filters);
    const productWhere = this.buildProductWhere(filters);
    const rows = await ProductBranch.findAll({
      where: { ...reportFilter },
      include: [
        {
          model: Product,
          as: "product",
          where: {
            ...productWhere,
            threshold: { [Op.gte]: sequelize.col("ProductBranch.inventory") },
          },
          include: [{ model: Category, as: "categoryProduct" }],
          attributes: [
            "id",
            "title",
            "sku",
            "cost",
            "threshold",
            "trackInventory",
          ],
        },
        {
          model: Branch,
          as: "branch",
          attributes: ["id", "name"],
        },
      ],
      order: [["inventory", "ASC"]],
    });
    let report = rows.map((row) => {
      const product = row.product!;
      const threshold = row.reorderLevel ?? product.threshold ?? 0;

      const currentQty = row.inventory;

      let stockStatus: "OK" | "LOW" | "OUT" = "OK";
      if (currentQty <= 0) stockStatus = "OUT";
      else if (currentQty <= threshold) stockStatus = "LOW";

      return {
        productId: product.id,
        productTitle: product.title,
        sku: product.sku,

        branchId: row.branchId,
        branchName: row.branch!.name,

        currentQty,
        reorderLevel: row.reorderLevel ?? threshold,
        productThreshold: product.threshold ?? 0,

        stockStatus,
        category: row.product?.categoryProduct.name,
      };
    });

    return report;
  }

  private async getStockValuationReport(filters: InventoryFilters) {
    const reportFilter = this.buildFilter(filters);
    console.log({ reportFilter });
    const productWhere = this.buildProductWhere(filters);

    const products = await ProductBranch.findAll({
      where: { ...reportFilter },
      include: [
        {
          model: Product,
          as: "product",
          where: { ...productWhere },
          include: [{ model: Category, as: "categoryProduct" }],
          attributes: ["id", "title", "sku", "cost", "threshold"],
        },
        { model: Branch, as: "branch", attributes: ["id", "name"] },
      ],
      order: [["qtySold", "DESC"]], // <-- order by quantity sold
    });

    const report = products.map((pb) => {
      const qty = pb.inventory ?? 0;
      const unitCost = pb.product?.cost ?? 0;
      const value = qty * unitCost;

      const reorderLevel = pb.reorderLevel ?? 0;
      const threshold = pb.product?.threshold ?? 0;

      let stockStatus: "OK" | "LOW" | "OUT" = "OK";
      if (qty === 0) stockStatus = "OUT";
      else if (qty <= Math.max(reorderLevel, threshold)) stockStatus = "LOW";

      return {
        productId: pb.productId,
        productTitle: pb.product?.title,
        sku: pb.product?.sku,
        branchId: pb.branchId,
        branchName: pb.branch?.name,
        currentQty: qty,
        unitCost,
        stockValue: value,
        reorderLevel,
        productThreshold: threshold,
        stockStatus,
        qtySold: pb.qtySold ?? 0, // <-- added
        category: pb.product?.categoryProduct.name,
      };
    });

    return report;
  }
}

export default new InventoryReportService();
