import { Op } from "sequelize";
import { Customer } from "../models/Customer.js";
import Debtor from "../models/Debtos.js";
import { PaginatedResponse } from "../types.js";
import { buildSearchQuery } from "../utils/helperFunctions.js";
import { Branch } from "../models/Branch.js";

class CustomerRepository {
  async createCustomer(data: any) {
    return Customer.create(data);
  }

  async updateCustomer(id: number, data: any) {
    const customer = await Customer.findByPk(id);
    if (!customer) throw new Error("Customer not found");
    return customer.update(data);
  }

  async getCustomerById(id: number) {
    return Customer.findByPk(id);
  }

  getAllCustomers = async (
    page: number = 1,
    limit: number = 10,
    search: string = "",
    baseWhere: any = {}
  ): Promise<PaginatedResponse<Customer> | Customer[]> => {
    const searchCondition = buildSearchQuery(
      ["firstName", "lastName", "email"],
      search
    );

    const where = {
      ...baseWhere,
      ...searchCondition,
    };

    // If no pagination, return all
    if (!limit && !page) {
      return await Customer.findAll({
        where,
        // include: [{ model: Category, as: "parentCategory" }],
        order: [["createdAt", "DESC"]],
      });
    }

    const offset = (page - 1) * limit;

    const { rows, count } = await Customer.findAndCountAll({
      where,
      include: [
        // { model: User, as: "creator", attributes: ["fullName", "id"] },
        // { model: Category, as: "parentCategory" },
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
  };

  async deleteCustomer(id: number) {
    const customer = await Customer.findByPk(id);
    if (!customer) throw new Error("Customer not found");
    return customer.destroy();
  }

  async bulkUpload(customers: Customer[]) {
    return Customer.bulkCreate(customers, { ignoreDuplicates: true });
  }

  async fetchDebtors(
    page: number = 1,
    limit: number = 10,
    search: string = "",
    baseWhere: any = {}
  ) {
    const searchCondition = buildSearchQuery(
      ["firstName", "lastName", "email"],
      search
    );

    const where = {
      ...baseWhere,
      ...searchCondition,
    };
    // If no pagination, return all
    if (!limit && !page) {
      return await Debtor.findAll({
        where: {
          ...where,
          totalOwed: { [Op.gt]: 0 },
        },
        include: [
          { model: Customer, as: "customerDebtor" },
          { model: Branch, as: "branchDebtor" },
        ],
        // order: [["createdAt", "DESC"]],
      });
    }
    const offset = (page - 1) * limit;

    const { rows, count } = await Debtor.findAndCountAll({
      where: {
        ...where,
        totalOwed: { [Op.gt]: 0 },
      },
      include: [
        { model: Customer, as: "customerDebtor" },
        { model: Branch, as: "branchDebtor" },
      ],
      limit,
      offset,
      // order: [["createdAt", "DESC"]],
    });
    return {
      rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    };
  }
}

export default new CustomerRepository();
