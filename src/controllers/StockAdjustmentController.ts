import StockAdjustmentService from "../services/StockAdjustmentService.js";
import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../utils/sendSuccess.js";

export class StockAdjustmentController {
  public async adjustStock(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      productId,
      quantity,
      direction,
      reason,
      note,
    } = req.body;

    const { tenantId, branchId,  userId } = (req as any).user;

    // 1️⃣ Normalize quantity change
    const qtyChange =
      direction === "DECREASE" ? -Math.abs(quantity) : Math.abs(quantity);

    // 2️⃣ Call service with clean data
    const adjustment = await StockAdjustmentService.adjustStock({
      productId,
      branchId,
      qtyChange,
      reason,
      note: note || null,
      userId,
      tenantId,
    });

    return sendSuccess(res, "Stock adjusted successfully", adjustment, 201);
  } catch (error) {
    next(error);
  }
}

public async listAdjustments(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const searchTerm = String(req.query.searchTerm || "");
    const baseWhere = {};
    const where = (req as any).applyDataScope("stockAdjustments", baseWhere);
    const adjustments = await StockAdjustmentService.getStockAdjustments(
      page,
      limit,
      searchTerm,
      where
    );
    return sendSuccess(res, "Stock adjustments retrieved successfully", adjustments, 200);
    } catch (error) {
        next(error);
    }
  }
}
