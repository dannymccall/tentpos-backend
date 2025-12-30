import { NextFunction, Request, Response } from "express";
import { sendSuccess } from "../utils/sendSuccess.js";
import salesReportService from "../services/reports/SalesReportService.js";
import inventoryReportService from "../services/reports/InventoryReportService.js"
export class ReportController {
  public getSalesReport = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const tenantId = (req as any).user.tenantId;
      const report = await salesReportService.reportHandler({
        ...req.body,
        tenantId,
      });

      console.log(report)

      return sendSuccess(res, "", report, 200)
    } catch (error) {
      next(error);
    }
  };
  public getInventoryReport = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const tenantId = (req as any).user.tenantId;
      const report = await inventoryReportService.reportHandler({
        ...req.body,
        tenantId,
      });

      console.log(report)

      return sendSuccess(res, "", report, 200)
    } catch (error) {
      next(error);
    }
  };
}
