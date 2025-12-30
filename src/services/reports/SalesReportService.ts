import { Sale } from "../../models/Sale.js";
import { SaleItem } from "../../models/SaleItem.js";
import { SaleReturn } from "../../models/SaleReturn.js";
import { SaleReturnItem } from "../../models/SaleReturnItems.js";
import { User } from "../../models/User.js";
import { Branch } from "../../models/Branch.js";
import {
  GeneralReportFilters,
  NormalizedSaleRow,
  PaymentBreakdown,
  SalesReportResult,
} from "../../types.js";
import { Op } from "sequelize";
import sequelize from "sequelize/lib/sequelize";
import { Customer } from "../../models/Customer.js";

class SalesReportService {
 private buildFilter = (filters: GeneralReportFilters) => {
    const { startDate, endDate, branchId, userId, tenantId } = filters;

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

    if (userId && typeof branchId !== "string") {
      // dynamically map to the right column

      reportFilter.userId = userId; // Loan table uses userId
    }

    return reportFilter;
  };

  public reportHandler = async (filters: GeneralReportFilters) => {
    if (filters.status === "summary") {
      const report = await this.reportSummary(filters);
      return report;
    }

    switch (filters.status) {
      case "CANCELLED":
        return await this.cancelledSalesReport(filters);
      case "COMPLETED":
        return await this.completedSalesReport(filters);
      case "PENDING":
        return await this.pendingSalesReport(filters);
      case "RETURN":
        return await this.returnedSalesReport(filters);
      case "cash":
        return await this.cashSalesReport(filters);
      case "mobile":
        return await this.momoSalesReport(filters);
        case "all":
            return await this.allSalesReport(filters);
    }
  };

  private async reportSummary(filters: GeneralReportFilters) {
    const reportFilter = this.buildFilter(filters);

    console.log({ reportFilter });
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
        ...reportFilter,
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
            ...reportFilter,
            status: "PAID",
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
        ...reportFilter,
      },
      raw: true,
    });

    const paymentBreakdownRaw = await Sale.findAll({
      attributes: [
        "paymentMethod",
        [sequelize.fn("SUM", sequelize.col("amountPaid")), "amount"],
      ],
      where: {
        ...reportFilter,
        status: { [Op.ne]: "CANCELLED" },
        paymentMethod: { [Op.ne]: null },
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

    return [
      {
        key: "Number of Sales",
        value: Number((salesSummary as any)?.totalSales || 0),
      },
      {
        key: "Sub Total",
        value: Number(salesSummary?.subtotal || 0),
      },
      { key: "Discount", value: Number(salesSummary?.discount || 0) },
      { key: "Tax", value: Number(salesSummary?.tax || 0) },
      { key: "Gross Sales", value: grossSales },
      {
        key: "Cash Received",
        value: Number((salesSummary as any)?.cashReceived || 0),
      },
      {
        key: "Outstanding Balance",
        value: Number((salesSummary as any)?.outstandingBalance || 0),
      },
      { key: "Returns", value: totalRefund },
      { key: "Net Profit", value: profit },
      { key: "COS", value: totalCost },
      { key: "Cash Payments", value: paymentMethods.cash },
      { key: "Momo Payments", value: paymentMethods.mobile },
      { key: "Bank Payments", value: paymentMethods.bank },
    ];
  }

  private async fetchSales(status: string, reportFilter: GeneralReportFilters) {
    return await Sale.findAll({
      where: {
        ...reportFilter,
        [Op.or]: [{ status }, { paymentMethod: status }],
      },
      include: [
        { model: Branch, as: "branchSale", attributes: ["name", "id"] },
        {
          model: Customer,
          as: "customer",
          attributes: ["id", "firstName", "lastName"],
        },
        { model: User, as: "userSale", attributes: ["id", "fullName"] },
      ],
    });
  }
  private buildSalesReport(sales: Sale[]): SalesReportResult {
    const totals = {
      subtotal: 0,
      discount: 0,
      tax: 0,
      total: 0,
      amountPaid: 0,
      balance: 0,
      count: 0,
    };

    const rows: NormalizedSaleRow[] = sales.map((sale) => {
      const subtotal = Number(sale.subtotal || 0);
      const discount = Number(sale.discount || 0);
      const tax = Number(sale.tax || 0);
      const total = Number(sale.total || 0);
      const amountPaid = Number(sale.amountPaid || 0);
      const balance = Number(sale.balance || 0);

      totals.subtotal += subtotal;
      totals.discount += discount;
      totals.tax += tax;
      totals.total += total;
      totals.amountPaid += amountPaid;
      totals.balance += balance;
      totals.count += 1;

      return {
        id: sale.id,
        saleNumber: sale.saleNumber,
        date:
          new Date(sale.date!).toISOString().split("T")[0] ??
          new Date(sale.createdAt!).toISOString().split("T")[0],
        status: sale.status,
        paymentMethod: sale.paymentMethod!,

        subtotal,
        discount,
        tax,
        total,
        amountPaid,
        balance,

        branch: sale.branchSale ? sale.branchSale.name : undefined,

        customer: sale.customer
          ? `${sale.customer.firstName!} ${sale.customer.lastName!}`
          : "Walk-In Customer",

        cashier: sale.userSale ? sale.userSale.fullName : undefined,
      };
    });

    return { rows, totals };
  }
 

  private async cancelledSalesReport(filters: GeneralReportFilters) {
    const reportFilter = this.buildFilter(filters);
    const sales = await this.fetchSales("CANCELLED", reportFilter);

    return this.buildSalesReport(sales);
  }
  private async completedSalesReport(filters: GeneralReportFilters) {
    const reportFilter = this.buildFilter(filters);
    const sales = await this.fetchSales("COMPLETED", reportFilter);

    return this.buildSalesReport(sales);
  }
  private async pendingSalesReport(filters: GeneralReportFilters) {
    const reportFilter = this.buildFilter(filters);
    const sales = await this.fetchSales("PENDING", reportFilter);

    return this.buildSalesReport(sales);
  }
  private async returnedSalesReport(filters: GeneralReportFilters) {
    const reportFilter = this.buildFilter(filters);
    const sales = await this.fetchSales("RETURN", reportFilter);

    return this.buildSalesReport(sales);
  }

  private async cashSalesReport(filters: GeneralReportFilters) {
    const reportFilter = this.buildFilter(filters);
    const sales = await this.fetchSales("cash", reportFilter);

    return this.buildSalesReport(sales);
  }
  private async momoSalesReport(filters: GeneralReportFilters) {
    const reportFilter = this.buildFilter(filters);
    const sales = await this.fetchSales("mobile", reportFilter);

    return this.buildSalesReport(sales);
  }
  private async allSalesReport(filters: GeneralReportFilters) {
    const reportFilter = this.buildFilter(filters);
    const sales = await Sale.findAll({
      where: {
        ...reportFilter,
      },
      include: [
        { model: Branch, as: "branchSale", attributes: ["name", "id"] },
        {
          model: Customer,
          as: "customer",
          attributes: ["id", "firstName", "lastName"],
        },
        { model: User, as: "userSale", attributes: ["id", "fullName"] },
      ],
    });

    return this.buildSalesReport(sales);
  }
}

export default new SalesReportService();
