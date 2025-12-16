import { Sale } from "../models/Sale.js";
import { SaleItem } from "../models/SaleItem.js";
import { Invoice } from "../models/Invoice.js";
import { Transaction } from "sequelize";
import { buildSearchQuery } from "../utils/helperFunctions.js";
import { Customer } from "../models/Customer.js";
import { Branch } from "../models/Branch.js";
import Product from "../models/Product.js";
import { User } from "../models/User.js";
import Payment from "../models/Payment.js";
import { SaleReturn } from "../models/SaleReturn.js";
import { SaleReturnItem } from "../models/SaleReturnItems.js";

class SaleRepository {
  public async createSale(saleData: Sale, transaction: Transaction) {
    try {
      const sale = await Sale.create(saleData, { transaction });
      const payload = saleData.saleItems?.map((it) => ({
        ...it,
        saleId: sale.id,
      }));
      await SaleItem.bulkCreate(payload as any, { transaction });
      return await Sale.findOne({
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
    } catch (err) {
      console.log(err);
      await transaction.rollback();
    }
  }

  public async getAllSales(
    page: number = 1,
    limit: number = 10,
    search: string = "",
    baseWhere: any = {},
    status?: string
  ) {
    const searchCondition = buildSearchQuery(["saleNumber"], search);

    const where = {
      ...baseWhere,
      ...searchCondition,
    };
    if (status) {
      where.status = status;
    }
    // If no pagination, return all
    if (!limit && !page) {
      return await Sale.findAll({
        where,
        include: [
          {
            model: SaleItem,
            as: "saleItems",
            include: [{ model: Product, as: "product", attributes: ["title"] }],
          },
          { model: Customer, as: "customer" },
          { model: Branch, as: "branchSale" },
        ],
        order: [["createdAt", "DESC"]],
      });
    }

    const offset = (page - 1) * limit;

    const { rows, count } = await Sale.findAndCountAll({
      where,
      include: [
        {
          model: SaleItem,
          as: "saleItems",
          include: [{ model: Product, as: "product", attributes: ["title"] }],
        },
        { model: Customer, as: "customer" },
        { model: Branch, as: "branchSale" },
        { model: Invoice, as: "invoice" },
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return {
      rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    };
  }

  public async getSale(id: number) {
    return await Sale.findByPk(id, {
      include: [
        { model: SaleItem, as: "saleItems" },
        { model: Customer, as: "customer" },
        { model: Branch, as: "branchSale" },
        { model: Invoice, as: "invoice" },
      ],
    });
  }

  public async delete(id: number, transaction: Transaction) {
    try {
      await SaleItem.destroy({
        where: { saleId: id },
        transaction: transaction,
      });
      await Sale.destroy({ where: { id }, transaction: transaction });
      await transaction?.commit();
      return true;
    } catch (err) {
      console.log(err);
      await transaction?.rollback();
      throw err;
    }
  }

  public async createInvoice(invoiceData: Invoice, transaction: Transaction) {
    const invoice = await Invoice.create(invoiceData, { transaction });
    return invoice;
  }
  public async recordPayment(payment: Payment, transaction: Transaction) {
    const invoice = await Invoice.create(payment as any, { transaction });
    return invoice;
  }

  public async getInvoices(
    page: number = 1,
    limit: number = 10,
    search: string = "",
    baseWhere: any = {}
  ) {
    const searchCondition = buildSearchQuery(["invoiceNumber"], search);
    const where = {
      ...baseWhere,
      ...searchCondition,
    };
    const offset = (page - 1) * limit;

    return await Invoice.findAndCountAll({
      where,
      include: [
        {
          model: Sale,
          as: "saleInvoice",
          include: [
            { model: Customer, as: "customer" },
            { model: User, as: "userSale", attributes: ["id", "fullName"] },
          ],
        },
        { model: Branch, as: "branchInvoice" },
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });
  }

  public async getSaleReturns(
    page: number = 1,
    limit: number = 10,
    search: string = "",
    baseWhere: any = {}
  ) {
    const searchCondition = buildSearchQuery(["invoiceNumber"], search);
    const where = {
      ...baseWhere,
      ...searchCondition,
    };
    const offset = (page - 1) * limit;

    return await SaleReturn.findAndCountAll({
      where,
      include: [
        {
          model: Sale,
          as: "sale",
          include: [],
        },
        {
          model: SaleReturnItem,
          as: "items",
          include: [
            { model: Product, as: "productItem", attributes: ["title"] },
          ],
        },
        { model: User, as: "processedBy", attributes: ["id", "fullName"] },
        { model: Branch, as: "branchReturn" },
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });
  }
}

export default new SaleRepository();
