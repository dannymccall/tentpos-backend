import { Request, Response, NextFunction } from "express";
import purchaseService from "../services/PurchaseService.js";
import { purchaseSchema } from "../utils/definitions.js";
import { sendSuccess } from "../utils/sendSuccess.js";
import { AppError } from "../utils/AppError.js";

class PurchaseController {
  public async create(req: Request, res: Response, next: NextFunction) {
    try {
        console.log(req.body)
      const tenantId = (req as any).user.tenantId;
      const payload = purchaseSchema.parse(req.body);
      (payload.header as any).tenantId = tenantId
      const created = await purchaseService.create(payload as any);
      return sendSuccess(res, "Purchase created successfully", created, 201);
    } catch (err) {
      next(err);
    }
  }

  public async list(req: Request, res: Response, next: NextFunction) {
    try {
      const baseWhere = {};
      const where = (req as any).applyDataScope("suppliers", baseWhere);
      const page = Number(req.query.page);
      const limit = Number(req.query.limit);
      const search = String(req.query.searchTerm || "");
      const purchases = await purchaseService.list(page, limit, search, where);
      return sendSuccess(res, "", purchases, 200)
    } catch (err) {
      next(err);
    }
  }

  public async get(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.query.id);
      const p = await purchaseService.get(id);
      if (!p) return next(new AppError("Not found", 404));

      return sendSuccess(res, "", p, 200)
    } catch (err) {
      next(err);
    }
  }

  public async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.query.id);
      const payload = purchaseSchema.parse(req.body);
      const updated = await purchaseService.update(id, payload);
      if (!updated) return next(new AppError("Not found", 404));
      return sendSuccess(res, "", updated, 200);
    } catch (err) {
      next(err);
    }
  }

  public async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.query.id);
      const ok = await purchaseService.remove(id);
      if (!ok) return next(new AppError("Not found", 404));
      return sendSuccess(res, "", ok, 200);
    } catch (err) {
      console.log(err)
      next(err);
    }
  }
}

export default new PurchaseController();
