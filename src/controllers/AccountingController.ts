import accountingService from "../services/AccountingService.js";
import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../utils/sendSuccess.js";

export class AccountingController {
  public async getIncomeStatement(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const tenantId = (req as any).user.tenantId;
      const incomeStatement = await accountingService.getIncomeStatement({
        ...req.body,
        tenantId,
      });
      return sendSuccess(res, "", incomeStatement, 200)
    } catch (error) {
      next(error);
    }
  }
  public async getProfitReport(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const tenantId = (req as any).user.tenantId;
      const incomeStatement = await accountingService.getProfitReport({
        ...req.body,
        tenantId,
      });
      return sendSuccess(res, "", incomeStatement, 200)
    } catch (error) {
      next(error);
    }
  }
  public async getCashflows(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const tenantId = (req as any).user.tenantId;
      const incomeStatement = await accountingService.getCashFlow({
        ...req.body,
        tenantId,
      });
      return sendSuccess(res, "", incomeStatement, 200)
    } catch (error) {
      next(error);
    }
  }
}
