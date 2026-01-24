import dashboardService from "../services/DashboardService.js";
import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../utils/sendSuccess.js";
export class DashboardController {
  public async getDashboardData(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const baseWhere = {};
      const where = (req as any).applyDataScope("dashboard", baseWhere);
      const data = await dashboardService.getDashboardService(where);
      return sendSuccess(res, "", data, 200);
    } catch (error) {
        console.log(error)
    }
  }
  public async getDailySummary(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const baseWhere = {};
      const where = (req as any).applyDataScope("daily-summary", baseWhere);
      const data = await dashboardService.getDailySummary(where);
      console.log(data)
      return sendSuccess(res, "", data, 200);
    } catch (error) {
        console.log(error)
    }
  }

    public getCounts = async (req: Request, res: Response, next: NextFunction) => {
    try{
       const baseWhere = {};
      const where = (req as any).applyDataScope("customers", baseWhere);
      const count = await dashboardService.getCounts(where);

      return sendSuccess(res, "", count, 200)
    }catch(error){
      next(error)
    }
  }
}
