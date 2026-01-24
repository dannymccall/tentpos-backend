import { Sale } from "../models/Sale.js";
import saleRepository from "../repositories/SaleRepository.js";
import sequelize from "../config/database.js";
import Product from "../models/Product.js";
import { Invoice } from "../models/Invoice.js";
import { SaleItem } from "../models/SaleItem.js";
import { ProductBranch } from "../models/ProductBranch.js";
import Debtor from "../models/Debtos.js";
import { Customer } from "../models/Customer.js";
import { ReturnDto } from "../types.js";
import { SaleReturn } from "../models/SaleReturn.js";
import { SaleReturnItem } from "../models/SaleReturnItems.js";
import StockAdjustmentService from "./StockAdjustmentService.js";
import { Transaction } from "sequelize";
import Payment from "../models/Payment.js";
import { Branch } from "../models/Branch.js";

interface CreateSaleInput extends Sale {
  holdSale?: boolean;
}

interface CompleteHoldSalePayload {
  saleId: number;
  amountPaid: number;
  paymentMethod: "cash" | "mobile" | "bank" | "crypto";
  userId: number;
  tenantId: string;
  branchId: number;
  tax: number;
  discount: number;
}

class SalesService {
 public async createSale(sale: CreateSaleInput) {
  return sequelize.transaction(async (t) => {

    /* =========================
       1. VALIDATE PRODUCTS
    ========================== */
    const productIds = sale?.saleItems?.map(i => i.productId);

    const products = await Product.findAll({
      where: { id: productIds },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    const branchProducts = await ProductBranch.findAll({
      where: { productId: productIds, branchId: sale.branchId },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    for (const item of sale.saleItems!) {
      const product = products.find(p => p.id === item.productId);
      const branchProduct = branchProducts.find(b => b.productId === item.productId);

      if (!product) {
        return { status: "error", message: "Product not found" };
      }

      if (!branchProduct) {
        return {
          status: "error",
          message: `Product ${product.title} not available in branch`,
        };
      }

      if (!sale.holdSale && branchProduct.inventory < item.quantity) {
        return {
          status: "error",
          message: `Insufficient stock for ${product.title}`,
        };
      }

      item.cost = Number(product.cost);
    }

    /* =========================
       2. CALCULATE TOTALS
    ========================== */
    const subtotal = sale.saleItems?.reduce(
      (sum, i) => sum + (Number(i.total) || i.price * i.quantity),
      0,
    );

    const tax = Number(sale.tax || 0);
    const discount = Number(sale.discount || 0);
    const total = subtotal! + tax - discount;
    const balance = total - sale.amountPaid;

    /* =========================
       3. VALIDATE PARTIAL RULE
    ========================== */
    if (
      !sale.holdSale &&
      sale.amountPaid < total &&
      sale.customerId == null
    ) {
      return {
        status: "error",
        message: "Customer required for partial or credit sales",
      };
    }

    /* =========================
       4. DERIVE STATUSES (🔥 IMPORTANT)
    ========================== */
    const status = sale.holdSale ? "HOLD" : "COMPLETED";

    const paymentStatus = sale.holdSale
      ? "HOLD"
      : balance === 0
        ? "PAID"
        : sale.amountPaid > 0
          ? "PARTIAL"
          : "CREDIT";

    /* =========================
       5. CREATE SALE (ONCE)
    ========================== */
    const newSale = await saleRepository.createSale(
      {
        saleNumber: `S-${Date.now()}`,
        customerId: sale.customerId,
        subtotal,
        discount,
        tax,
        total,
        amountPaid: sale.amountPaid,
        balance,
        paymentMethod: sale.paymentMethod,
        status,
        paymentStatus,
        tenantId: sale.tenantId,
        branchId: sale.branchId,
        date: sale.date ? new Date(sale.date) : new Date(),
        userId: sale.userId,
        saleItems: sale.saleItems,
      } as any,
      t,
    );

    /* =========================
       6. STOP HERE FOR HOLD SALES
    ========================== */
    if (sale.holdSale) {
      return { status: "success", newSale };
    }

    /* =========================
       7. CREATE INVOICE (ONCE)
    ========================== */
    const invoice = await saleRepository.createInvoice(
      {
        invoiceNumber: `INV-${Date.now()}`,
        saleId: newSale?.id!,
        customerId: sale.customerId,
        amountDue: total,
        status:
          balance === 0 ? "PAID" :
          sale.amountPaid > 0 ? "PARTIAL" :
          "UNPAID",
        tenantId: sale.tenantId,
        branchId: sale.branchId,
      } as any,
      t,
    );

    /* =========================
       8. RECORD PAYMENT (ONCE)
    ========================== */
    if (sale.amountPaid > 0) {
      await saleRepository.recordPayment(
        {
          saleId: newSale?.id,
          amount: sale.amountPaid,
          tenantId: sale.tenantId,
          userId: sale.userId,
          branchId: sale.branchId,
          method: sale.paymentMethod || "CASH",
          description: `Payment for sale ${newSale?.saleNumber}`,
        } as any,
        t,
      );
    }

    /* =========================
       9. HANDLE DEBTOR
    ========================== */
    if (balance > 0) {
      const customer = await Customer.findByPk(sale.customerId!, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!customer) {
        return { status: "error", message: "Customer not found" };
      }

      const debtor = await Debtor.findOne({
        where: { customerId: sale.customerId! },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      const projectedDebt =
        (debtor ? Number(debtor.totalOwed) : 0) + balance;

      if (
        customer.creditLimitAllocated &&
        projectedDebt > Number(customer.creditLimit)
      ) {
        return {
          status: "error",
          message: `Credit limit of ${customer.creditLimit} exceeded`,
        };
      }

      if (debtor) {
        await debtor.update(
          {
            totalOwed: projectedDebt,
            lastSaleDate: new Date(),
            status: "ACTIVE",
          },
          { transaction: t },
        );
      } else {
        await Debtor.create(
          {
            customerId: sale.customerId!,
            totalOwed: balance,
            oldestDebtDate: new Date(),
            lastSaleDate: new Date(),
            status: "ACTIVE",
            tenantId: sale.tenantId,
            branchId: sale.branchId,
          },
          { transaction: t },
        );
      }
    }

    /* =========================
       10. UPDATE INVENTORY
    ========================== */
    for (const item of sale.saleItems!) {
      await Promise.all([
        ProductBranch.increment("qtySold", {
          by: item.quantity,
          where: { productId: item.productId, branchId: sale.branchId },
          transaction: t,
        }),
        ProductBranch.decrement("inventory", {
          by: item.quantity,
          where: { productId: item.productId, branchId: sale.branchId },
          transaction: t,
        }),
      ]);
    }

    return { status: "success", newSale, invoice };
  });
}


  public async list(
    page: number = 1,
    limit: number = 10,
    search: string = "",
    baseWhere: any = {},
    status?: string,
    customerId?:number
  ) {
    return await saleRepository.getAllSales(
      page,
      limit,
      search,
      baseWhere,
      status,
      customerId
    );
  }

  public async get(id: number) {
    return saleRepository.getSale(id);
  }

  public async cancelSale(saleId: number) {
    return sequelize.transaction(async (t) => {
      const sale = await Sale.findByPk(saleId, {
        include: [{ model: SaleItem, as: "saleItems" }],
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!sale) {
        return { status: "error", message: "Sale not found" };
      }

      if (sale.status === "CANCELLED") {
        return { status: "error", message: "Sale already cancelled" };
      }

      const saleItems = sale.saleItems || [];

      // 2. Restore inventory
      for (const item of saleItems) {
        await Promise.all([
          ProductBranch.decrement("qtySold", {
            by: item.quantity,
            where: { id: item.productId },
            transaction: t,
          }),
        ]);
        await StockAdjustmentService.adjustStock(
          {
            productId: item.productId,
            branchId: sale.branchId!,
            qtyChange: item.quantity, // INCREASE
            reason: "FOUND",
            note: "Return - resaleable",
            userId: sale.userId,
            tenantId: sale.tenantId,
          },
          t,
        );
      }

      // 3. Update sale status
      sale.status = "CANCELLED";
      sale.paymentStatus = "VOID";
      sale.balance = 0;
      await sale.save({ transaction: t });

      // 4. Cancel invoice
      const invoice = await Invoice.findOne({
        where: { saleId },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (invoice) {
        invoice.status = "CANCELLED";
        await invoice.save({ transaction: t });
      }

      return {
        status: "success",
        message: "Sale cancelled successfully",
        sale,
        invoice,
      };
    });
  }

  public async getInvoices(
    page: number = 1,
    limit: number = 10,
    search: string = "",
    baseWhere: any = {},
  ) {
    return await saleRepository.getInvoices(page, limit, search, baseWhere);
  }


  public async returnSale(payload: ReturnDto, userId: number) {
    return sequelize.transaction(async (t) => {
      const { items, note, reason, saleId, refundMethod } = payload;

      if (!items || items.length === 0) {
        throw new Error("Return items cannot be empty");
      }

      const sale = await Sale.findByPk(saleId, {
        include: [{ model: SaleItem, as: "saleItems" }],
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!sale) {
        throw new Error("Sale not found");
      }

      let refundTotal = 0;

      // 1️⃣ Validate & calculate refund
      for (const item of items) {
        const saleItem = sale.saleItems?.find(
          (si) => si.id === item.saleItemId,
        );

        if (!saleItem) {
          throw new Error("Invalid sale item");
        }

        // Sum previous returns for this sale item
        const alreadyReturned =
          (await SaleReturnItem.sum("quantity", {
            where: { saleItemId: saleItem.id },
            transaction: t,
          })) || 0;

        const remainingQty = saleItem.quantity - alreadyReturned;

        if (item.quantityToReturn <= 0) {
          throw new Error("Return quantity must be greater than zero");
        }

        if (item.quantityToReturn > remainingQty) {
          throw new Error(
            `Cannot return more than remaining quantity (${remainingQty})`,
          );
        }

        refundTotal += item.quantityToReturn * saleItem.price;
      }

      // 2️⃣ Create Sale Return
      const saleReturn = await SaleReturn.create(
        {
          saleId,
          tenantId: sale.tenantId,
          branchId: sale.branchId!,
          totalRefund: refundTotal,
          refundMethod: refundMethod as "CASH",
          reason,
          note,
          userId,
        },
        { transaction: t },
      );

      // 3️⃣ Create Return Items + Adjust Stock
      for (const item of items) {
        const saleItem = sale.saleItems!.find(
          (si) => si.id === item.saleItemId,
        )!;

        await SaleReturnItem.create(
          {
            saleReturnId: saleReturn.id,
            saleItemId: saleItem.id,
            productId: saleItem.productId,
            quantity: item.quantityToReturn,
            unitPrice: saleItem.price,
            condition: item.condition,
            refundAmount: item.quantityToReturn * saleItem.price,
          },
          { transaction: t },
        );

        // 4️⃣ Inventory logic
        if (item.condition === "RESALEABLE") {
          await StockAdjustmentService.adjustStock(
            {
              productId: saleItem.productId,
              branchId: sale.branchId!,
              qtyChange: item.quantityToReturn, // INCREASE
              reason: "FOUND",
              note: "Return - resaleable",
              userId,
              tenantId: sale.tenantId,
            },
            t,
          );
        }
      }

      // 5️⃣ Update sale financials
      sale.amountPaid -= refundTotal;
      sale.balance = sale.total - sale.amountPaid;

      if (sale.amountPaid <= 0) {
        sale.paymentStatus = "UNPAID";
      } else if (sale.balance > 0) {
        sale.paymentStatus = "PARTIAL";
      } else {
        sale.paymentStatus = "PAID";
      }
      sale.status = "RETURN";
      await sale.save({ transaction: t });
      await Invoice.update(
        { status: "RETURN" },
        { where: { saleId }, transaction: t },
      );
      return {
        status: "success",
        refundTotal,
        saleReturnId: saleReturn.id,
      };
    });
  }
  public async getSaleReturn(
    page: number = 1,
    limit: number = 10,
    search: string = "",
    baseWhere: any = {},
  ) {
    return await saleRepository.getSaleReturns(page, limit, search, baseWhere);
  }

  public async completeHoldSale(payload: CompleteHoldSalePayload) {
    const transaction: Transaction = await sequelize.transaction();
    try {
      const sale = await Sale.findOne({
        where: {
          id: payload.saleId,
          tenantId: payload.tenantId,
          branchId: payload.branchId,
        },
        include: [{ model: SaleItem, as: "saleItems" }],
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!sale) {
        throw new Error("Sale not found");
      }

      if (sale.status !== "HOLD") {
        throw new Error("Only HOLD sales can be completed");
      }

      if (payload.amountPaid <= 0) {
        throw new Error("Invalid payment amount");
      }

      // 1️⃣ Validate stock before touching anything
      for (const item of sale.saleItems!) {
        const product = await Product.findByPk(item.productId, {
          transaction,
          include: [{ model: ProductBranch, as: "branches" }],
          lock: transaction.LOCK.UPDATE,
        });

        if (!product) {
          throw new Error("Product not found");
        }

        if (product.branches![0].inventory < item.quantity) {
          throw new Error(`Insufficient stock for ${product.title}`);
        }
      }

      // 2️⃣ Deduct inventory
      for (const item of sale.saleItems!) {
        await Promise.all([
          ProductBranch.decrement(
            { inventory: item.quantity },
            {
              where: { id: item.productId },
              transaction,
            },
          ),
          ProductBranch.increment("qtySold", {
            by: item.quantity,
            where: { id: item.productId },
          }),
        ]);
      }

      // 3️⃣ Create payment record
      await Payment.create(
        {
          saleId: sale.id,
          amount: payload.amountPaid,
          method: payload.paymentMethod as any,
          userId: payload.userId,
          tenantId: payload.tenantId,
          branchId: payload.branchId,
          description: `Sale payment for sale ${sale.saleNumber}`,
        },
        { transaction },
      );
      // 4️⃣ Update sale
      const tax = Number(payload.tax || 0);
      const discount = Number(payload.discount);
      sale.status = "COMPLETED";
      sale.amountPaid = payload.amountPaid;
      sale.total = sale.total! + tax - discount;
      sale.balance = sale.total - payload.amountPaid;
      sale.paymentMethod = payload.paymentMethod;
      sale.paymentStatus = "PAID";
      sale.tax = tax;
      sale.discount = discount;
      await sale.save({ transaction });

      const invoice = await saleRepository.createInvoice(
        {
          invoiceNumber: `INV-${Date.now()}`,
          saleId: sale?.id,
          customerId: sale.customerId,
          amountDue: sale.total,
          status: "PAID",
          tenantId: sale.tenantId,
          branchId: sale.branchId,
        } as any,
        transaction,
      );
      // 5️⃣ Commit everything
      const completedSale = await Sale.findOne({
        where: { id: sale.id },
        include: [
          {
            model: SaleItem,
            as: "saleItems",
            include: [
              { model: Product, as: "product", attributes: ["id", "title"] },
            ],
          },
          { model: Customer, as: "customer" },
          { model: Branch, as: "branchSale" },
          { model: Invoice, as: "invoice" },
        ],
        transaction,
      });
      await transaction.commit();
      return {
        sale: completedSale,
        invoice,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

export default new SalesService();
