// src/services/ExpenseService.ts
import { ExpenseRepository } from "../repositories/ExpenseRepository.ts.js";
import { AppError } from "../utils/AppError.js";

export class ExpenseService {
    
  public async createExpense(data: any) {
    return ExpenseRepository.createExpense(data);
  }

  public async getAllExpenses( page: number = 1,
    limit: number = 10,
    search: string = "",
    baseWhere: any = {}) {
    return ExpenseRepository.getExpensesByTenant(page, limit, search, baseWhere);
  }

  public async getExpense(id: number, tenantId: string) {
    const expense = await ExpenseRepository.getExpenseById(id, tenantId);
    if (!expense) throw new AppError("Expense not found", 404);
    return expense;
  }

  public async updateExpense(id: number, data: any) {
    const expense = await ExpenseRepository.updateExpense(id, data);
    if (!expense) throw new AppError("Expense not found", 404);
    return expense;
  }

  public async deleteExpense(id: number, tenantId: string) {
    const deleted = await ExpenseRepository.deleteExpense(id, tenantId);
    if (!deleted) throw new AppError("Expense not found", 404);
    return deleted;
  }
}
