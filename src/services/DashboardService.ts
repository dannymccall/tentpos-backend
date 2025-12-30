import { Sale } from "../models/Sale.js";
import Product from "../models/Product.js";
import { Invoice } from "../models/Invoice.js";
import { ProductBranch } from "../models/ProductBranch.js";
import { Op } from "sequelize";
import sequelize, { col, fn } from "sequelize/lib/sequelize";
import { SaleReturn } from "../models/SaleReturn.js";
import { SaleItem } from "../models/SaleItem.js";
import Debtor from "../models/Debtos.js";
import { Customer } from "../models/Customer.js";
import { User } from "../models/User.js";
import StockAdjustment from "../models/StockAdjustment.js";

class DashboardService {
  public async getDashboardService(baseWhere: any = {}) {
    const todaySales = await Sale.sum("amountPaid", {
      where: {
        status: "COMPLETED",
        createdAt: {
          [Op.between]: [
            new Date("2025-12-16").setHours(0, 0, 0, 0),
            new Date("2025-12-16").setHours(23, 59, 59, 999),
          ],
        },
        ...baseWhere,
      },
    });

    const totalSales = await Sale.sum("amountPaid", {
      where: { ...baseWhere },
    });
    const outOfStockCount = await ProductBranch.count({
      where: { ...baseWhere },
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "title", "threshold"],
          required: true,
          where: {
            threshold: { [Op.gte]: sequelize.col("ProductBranch.inventory") }, // <-- compare correctly
          },
        },
      ],
    });
    const totalProducts = await Product.count({ where: { ...baseWhere } });
    const totalReturnAmount = await SaleReturn.sum("totalRefund", {
      where: { ...baseWhere },
    });

    const paymentStypeStats = await Sale.findAll({
      attributes: [
        ["paymentMethod", "name"], // alias for output
        [sequelize.fn("COUNT", sequelize.col("paymentMethod")), "value"], // or SUM("amount") if you want total
      ],
      group: ["paymentMethod"],
      raw: true,
    });

    const outOfStock = await ProductBranch.findAll({
      where: { ...baseWhere },
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "title", "threshold"],
          required: true,
          where: {
            ...baseWhere,
            threshold: { [Op.gte]: sequelize.col("ProductBranch.inventory") }, // <-- compare correctly
          },
        },
      ],
      attributes: ["inventory"],
    });

    const totalRevenue = await Sale.findOne({
      attributes: [
        [sequelize.fn("SUM", sequelize.col("total")), "totalRevenue"],
      ],
      where: { ...baseWhere },
      raw: true,
    });

    const totalProfit = await SaleItem.findOne({
      attributes: [
        [
          sequelize.fn("SUM", sequelize.literal("(price - cost) * quantity")),
          "totalProfit",
        ],
      ],
      where: { ...baseWhere },
      raw: true,
    });

    const expectedRevenue = await Sale.findOne({
      attributes: [
        [sequelize.fn("SUM", sequelize.col("balance")), "expectedRevenue"],
      ],
      where: {
        ...baseWhere,
        paymentStatus: ["UNPAID", "PARTIAL"],
        status: ["PENDING", "HOLD", "COMPLETED"],
      },
      raw: true,
    });

    const monthlySales = await Sale.findAll({
      where: {
        ...baseWhere,
        paymentStatus: ["PAID", "PARTIAL"],
      },
      attributes: [
        [
          sequelize.fn("DATE_FORMAT", sequelize.col("createdAt"), "%Y-%m"),
          "month",
        ],
        [sequelize.fn("SUM", sequelize.col("amountPaid")), "sales"],
        [sequelize.fn("COUNT", sequelize.col("id")), "transactions"],
      ],
      group: ["month"],
      order: [[sequelize.literal("month"), "ASC"]],
      raw: true,
    });

    const recentSales = await Sale.findAll({
      where: { ...baseWhere, paymentStatus: ["PAID", "PARTIAL"] },
      include: [
        {
          model: Customer,
          as: "customer",
          attributes: ["firstName", "lastName", "id"],
        },
        {
          model: User,
          as: "userSale",
          attributes: ["fullName"],
        },
      ],
      limit: 5,
      order: ["createdAt"],
      attributes: ["amountPaid", "createdAt"],
    });

    const totalDebt = await Debtor.sum("totalOwed", {
      where: { ...baseWhere },
    });
    return {
      todaySales: todaySales || 0,
      totalSales: totalSales || 0,
      outOfStockCount: outOfStockCount || 0,
      totalProducts: totalProducts || 0,
      totalReturnAmount: totalReturnAmount || 0,
      paymentTypeStats: paymentStypeStats || [],
      outOfStock: outOfStock || 0,
      totalRevenue: totalRevenue || 0,
      totalProfit: totalProfit || 0,
      totalDebt: totalDebt || 0,
      expectedRevenue: expectedRevenue || 0,
      monthlySales: monthlySales || [],
      recentSales: recentSales || [],
    };
  }

  public async getDailySummary(baseWhere: any = {}) {
    const startOfDay = new Date("2025-12-15 00:00:00");
    const endOfDay = new Date("2025-12-15 23:59:59");

    const salesSummary = await Sale.findOne({
      attributes: [
        [sequelize.fn("COUNT", sequelize.col("id")), "totalSales"],
        [sequelize.fn("SUM", sequelize.col("subtotal")), "subtotal"],
        [sequelize.fn("SUM", sequelize.col("discount")), "discount"],
        [sequelize.fn("SUM", sequelize.col("tax")), "tax"],
        [sequelize.fn("SUM", sequelize.col("total")), "grossSales"],
        [sequelize.fn("SUM", sequelize.col("amountPaid")), "cashReceived"],
        [sequelize.fn("SUM", sequelize.col("balance")), "outstandingBalance"],
      ],
      where: {
        ...baseWhere,
        status: { [Op.ne]: "CANCELLED" },
        createdAt: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
      raw: true,
    });

    const cogs = await SaleItem.findOne({
      attributes: [[sequelize.fn("SUM", sequelize.col("cost")), "totalCost"]],
      include: [
        {
          model: Sale,
          as: "sale",
          attributes: [],
          where: {
            ...baseWhere,
            status: "PAID",
            createdAt: {
              [Op.between]: [startOfDay, endOfDay],
            },
          },
        },
      ],
      raw: true,
    });

    const returnSummary = await SaleReturn.findOne({
      attributes: [
        [sequelize.fn("COUNT", sequelize.col("id")), "totalReturns"],
        [sequelize.fn("SUM", sequelize.col("totalRefund")), "totalRefund"],
      ],
      where: {
        ...baseWhere,
        createdAt: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
      raw: true,
    });
    const stockLoss = await StockAdjustment.findOne({
      attributes: [
        [sequelize.fn("SUM", sequelize.literal("ABS(qtyChange)")), "lostQty"],
      ],
      where: {
        ...baseWhere,
        reason: { [Op.in]: ["BROKEN", "EXPIRED", "LOST"] },
        createdAt: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
      raw: true,
    });

    const paymentBreakdownRaw = await Sale.findAll({
      attributes: [
        "paymentMethod",
        [sequelize.fn("SUM", sequelize.col("amountPaid")), "amount"],
      ],
      where: {
        ...baseWhere,
        status: { [Op.ne]: "CANCELLED" },
        paymentMethod: { [Op.ne]: null },
        createdAt: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
      group: ["paymentMethod"],
      raw: true,
    });
    const paymentMethods = {
      cash: 0,
      mobile: 0,
      bank: 0,
    };

    for (const row of paymentBreakdownRaw as any[]) {
      const method = row.paymentMethod as keyof typeof paymentMethods;
      if (paymentMethods[method] !== undefined) {
        paymentMethods[method] = Number(row.amount || 0);
      }
    }

    const grossSales = Number((salesSummary as any)?.grossSales || 0);
    const totalCost = Number((cogs as any)?.totalCost || 0);
    const totalRefund = Number(returnSummary?.totalRefund || 0);

    const profit = grossSales - totalCost - totalRefund;

    return {
      date: "2025-12-17",
      sales: {
        count: Number((salesSummary as any)?.totalSales || 0),
        subtotal: Number(salesSummary?.subtotal || 0),
        discount: Number(salesSummary?.discount || 0),
        tax: Number(salesSummary?.tax || 0),
        grossSales,
        cashReceived: Number((salesSummary as any)?.cashReceived || 0),
        outstandingBalance: Number(
          (salesSummary as any)?.outstandingBalance || 0
        ),
      },
      returns: {
        count: Number((returnSummary as any)?.totalReturns || 0),
        amount: totalRefund,
      },
      inventory: {
        lostQty: Number((stockLoss as any)?.lostQty || 0),
      },
      profit: {
        cogs: totalCost,
        netProfit: profit,
      },
      payments: {
        cash: paymentMethods.cash,
        momo: paymentMethods.mobile,
        bank: paymentMethods.bank,
      },
    };
  }
}

export default new DashboardService();
