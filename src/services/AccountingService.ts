import { ProductBranch } from "../models/ProductBranch.js";
import { Sale } from "../models/Sale.js";
import { Expense } from "../models/Expenses.js";
import { col, Op } from "sequelize";
import { AccountingFilters } from "../types.js";
import Product from "../models/Product.js";
import { SaleItem } from "../models/SaleItem.js";
import sequelize, { Sequelize } from "sequelize/lib/sequelize";

class AccountService {
  private buildFilter = (filters: AccountingFilters) => {
    const { startDate, endDate, branchId, tenantId } = filters;

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
      reportFilter.branchId = branchId;
    }

    return reportFilter;
  };
  public async getIncomeStatement(filters: AccountingFilters) {
    const accountingFilter = this.buildFilter(filters);
    const revenue = await Sale.sum("total", {
      where: {
        ...accountingFilter,
      },
    });

    const productBranches = await ProductBranch.findAll({
      where: {
        ...accountingFilter,
      },
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["cost"],
        },
      ],
    });

    let cogs = 0;

    for (const pb of productBranches) {
      const qtySold = pb.qtySold ?? 0;
      const cost = pb.product?.cost ?? 0;
      cogs += qtySold * cost;
    }

    const expenses = await Expense.sum("amount", {
      where: {
        ...accountingFilter,
      },
    });

    const grossProfit = (revenue ?? 0) - cogs;
    const netProfit = grossProfit - (expenses ?? 0);

    return {
      period: `${filters.startDate} → ${filters.endDate}`,
      revenue: revenue ?? 0,
      cogs,
      grossProfit,
      expenses: expenses ?? 0,
      netProfit,
    };
  }
  public async getProfitReport(filters: AccountingFilters) {
    const accountingFilter = this.buildFilter(filters);

    /**
     * SALES (Revenue per product)
     */
    const sales = await SaleItem.findAll({
      attributes: [
        "productId",
        [sequelize.fn("SUM", sequelize.col("quantity")), "qtySold"],
        [sequelize.fn("SUM", col("total")), "revenue"],
      ],
      where: {
        ...accountingFilter,
      },
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["title", "cost"],
        },
      ],
      group: ["productId", "product.id"],
    });

    let totalRevenue = 0;
    let totalCogs = 0;
    const totals = {
      qtySold: 0,
      revenue: 0,
      cogs: 0,
      profit: 0,
    };

    const data = sales.map((row: any) => {
      const qtySold = Number(row.get("qtySold") ?? 0);
      const revenue = Number(row.get("revenue") ?? 0);
      const cost = Number(row.product?.cost ?? 0);

      const cogs = qtySold * cost;
      const profit = revenue - cogs;
      const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

      // accumulate totals
      totals.qtySold += qtySold;
      totals.revenue += revenue;
      totals.cogs += cogs;
      totals.profit += profit;

      return {
        productId: row.productId,
        productName: row.product?.title ?? "Unknown",
        qtySold,
        revenue,
        cogs,
        profit,
        margin,
      };
    });

    return {
      data,
      period: `${filters.startDate} → ${filters.endDate}`,

      totals: {
        ...totals,
        margin: totals.revenue > 0 ? (totals.profit / totals.revenue) * 100 : 0,
      },
    };
  }

  public async getCashFlow(filters: AccountingFilters) {
    const where = this.buildFilter(filters);

    // ---------------- INFLOWS ----------------
    const inflows = await Sale.findAll({
      where,
      attributes: [
        "paymentMethod",
        [Sequelize.fn("SUM", Sequelize.col("amountPaid")), "total"],
      ],
      group: ["paymentMethod"],
    });

    const inflowSummary = inflows.map((row: any) => ({
      method: row.paymentMethod,
      amount: Number(row.get("total") ?? 0),
    }));

    const totalInflows = inflowSummary.reduce((sum, r) => sum + r.amount, 0);

    // ---------------- OUTFLOWS ----------------
    const expenses = await Expense.findAll({
      where,
      attributes: [
        "category",
        [Sequelize.fn("SUM", Sequelize.col("amount")), "total"],
      ],
      group: ["category"],
    });

    const outflowSummary = expenses.map((row: any) => ({
      category: row.category,
      amount: Number(row.get("total") ?? 0),
    }));

    const totalOutflows = outflowSummary.reduce((sum, r) => sum + r.amount, 0);

    // ---------------- NET ----------------
    const netCashFlow = totalInflows - totalOutflows;

    return {
      period: `${filters.startDate} → ${filters.endDate}`,
      inflows: {
        breakdown: inflowSummary,
        total: totalInflows,
      },
      outflows: {
        breakdown: outflowSummary,
        total: totalOutflows,
      },
      netCashFlow,
    };
  }
}

export default new AccountService();
