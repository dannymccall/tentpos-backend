// src/controllers/ExpenseController.ts
import { Request, Response, NextFunction } from "express";
import { ExpenseService } from "../services/ExpenseService.js";
import { sendSuccess } from "../utils/sendSuccess.js";
// import { AuditLogRepository } from "../repositories/AuditLogRepository.js";


interface AuthenticatedRequest extends Request {
  user?: any;
}

export class ExpenseController {
  private service: ExpenseService;

  constructor() {
    this.service = new ExpenseService();
  }

  public createExpense = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { tenantId, userId, branchId } = req.user;
      const data = req.body;
      // const settings = await ExpenseSettings.findOne({ where: { tenantId } });

      // if (!settings) {
      //   return next(
      //     new AppError("No Settings configured for expense settings")
      //   );
      // }
      const expense = await this.service.createExpense({
        ...data,
        branchId,
        tenantId,
      });

      // const entry = await JournalEntryService.createEntry(
      //   {
      //     description: `${data.title} on loan disbursement`,
      //     module: "manual",
      //     referenceId: expense.id,
      //     tenantId: tenantId,
      //     userId: userId,
      //     branchId: branchId,
      //     date: new Date(),
      //     lines: [
      //       { accountId: settings.defaultAccountId, debit: data.amount },
      //       { accountId: settings.expenseCategoryAccountId, credit: data.amount },
      //     ],
      //   },
      // );

      // await AuditLogRepository.createLog({
      //   tenantId,
      //   branchId,
      //   userId,
      //   description: `Created new expense: ${expense.title}`,
      //   action: "CREATE_EXPENSE",
      //   timestamp: new Date(),
      //   entity: "Expense",
      //   entityId: expense.id,
      // });

      return res.status(201).json(expense);
    } catch (err: any) {
        console.log(err)
      return res.status(400).json({ error: err.message });
    }
  };

  public getExpenses = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { page, limit, searchTerm } = req.query;
      console.log(page, limit, searchTerm);
      const baseWhere = {};
      const where = (req as any).applyDataScope("expenses", baseWhere);
      const expenses = await this.service.getAllExpenses(Number(page), Number(limit), searchTerm as string, where);
      return sendSuccess(res, "success", expenses, 200);
    } catch (err) {
      next(err);
    }
  };

  public getExpense = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { tenantId } = req.user;
      const { id } = req.params;

      const expense = await this.service.getExpense(Number(id), tenantId);
      return sendSuccess(res, "success", expense, 200);
    } catch (err) {
      next(err);
    }
  };

  public updateExpense = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { tenantId, userId } = req.user;
      const { id } = req.query;
      const data = req.body;

      const expense = await this.service.updateExpense(
        Number(id),
        data
      );

      // await AuditLogRepository.createLog({
      //   tenantId,
      //   branchId: expense.branchId,
      //   userId,
      //   description: `Updated expense with ID ${id}`,
      //   action: "UPDATE_EXPENSE",
      //   timestamp: new Date(),
      //   entity: "Expense",
      //   entityId: Number(id),
      // });

      return sendSuccess(res, "updated", expense, 200);
    } catch (err) {
      next(err);
    }
  };

  public deleteExpense = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { tenantId, userId } = req.user;
      const { id } = req.query;

      await this.service.deleteExpense(Number(id), tenantId);

      // await AuditLogRepository.createLog({
      //   tenantId,
      //   branchId: null,
      //   userId,
      //   description: `Deleted expense with ID ${id}`,
      //   action: "DELETE_EXPENSE",
      //   timestamp: new Date(),
      //   entity: "Expense",
      //   entityId: Number(id),
      // });

      return sendSuccess(res, "Expense deleted", {}, 201);
    } catch (err) {
      next(err);
    }
  };
}
