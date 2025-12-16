// src/repositories/ExpenseRepository.ts

import { Branch } from "../models/Branch.js";
import { Expense } from "../models/Expenses.js";
import { PaginatedResponse } from "../types.js";
import { buildSearchQuery } from "../utils/helperFunctions.js";

export class ExpenseRepository {
  public static async createExpense(data: any) {
    return Expense.create(data);
  }

  public static async getExpensesByTenant(
    page: number = 1,
    limit: number = 10,
    search: string = "",
    baseWhere: any = {}
  ): Promise<PaginatedResponse<Expense> | Expense[]> {
    const searchCondition = buildSearchQuery(
      ["title", "amount", "category", "description", "systemId", "branch.name"],
      search
    );

    const where = { ...baseWhere, ...searchCondition };
    if (!limit && !page) {
      return await Expense.findAll({
        where: where,
      });
    }

    const offset = (page - 1) * limit;
    const { rows, count } = await Expense.findAndCountAll({
      where: where,
      limit,
      offset,
      include: [
        {model: Branch, as: "branchExpense", attributes: ["name"]}
      ],
      order: [["createdAt", "DESC"]],
    });

      return {
      rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    };
  }

  public static async getExpenseById(id: number, tenantId: string) {
    return Expense.findOne({
      where: { id, tenantId },
    });
  }

  public static async updateExpense(id: number, data: any) {
    const records = await Expense.findByPk(id);
    if(records){
      await records.update(data)
    }
  return records;
   
  }

  public static async deleteExpense(id: number, tenantId: string) {
    return Expense.destroy({ where: { id, tenantId } });
  }
}
