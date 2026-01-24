import SupplierService from "../services/SupplierService.js";
import { Request, Response, NextFunction } from "express";
import { createSchema } from "../utils/definitions.js";
import { sendSuccess } from "../utils/sendSuccess.js";
import { AppError } from "../utils/AppError.js";

export class SupplierController {
  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = createSchema.parse(req.body);
      const tenantId = (req as any).user.tenantId;
      const created = await SupplierService.create({...payload, tenantId});
      return sendSuccess(res, "Supplier created successfully", created, 201);
    } catch (err: any) {
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

      const suppliers = await SupplierService.list(page, limit, search, where);
      return sendSuccess(res, "", suppliers, 200);
    } catch (error) {
      next(error);
    }
  }

  public async get(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.query.id);
      const s = await SupplierService.get(id);
      if (!s) return next(new AppError("Not found"));
      return sendSuccess(res, "", s, 200);
    } catch (err) {
      next(err);
    }
  }

  public async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.query.id);
      const payload = createSchema.partial().parse(req.body);
      const updated = await SupplierService.update(id, payload);
      if (!updated) return next(new AppError("Not found"));
      return sendSuccess(res, "Supplier created successfully", updated, 201);
    } catch (err: any) {
      next(err);
    }
  }

  public async remove(req: Request, res: Response, next: NextFunction) {
    const id = Number(req.query.id);
    const ok = await SupplierService.remove(id);
    if (!ok) return next(new AppError("Not found"));
    return sendSuccess(res, "Supplier created successfully", ok, 201);
  }

   public bulkUpload = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const suppliers = req.body;
      const { tenantId} = (req as any).user
      if (!suppliers || !suppliers.length) return next(new AppError("suppliers not found", 400));

      const bulk = await SupplierService.bulkUpload(suppliers, tenantId );

      return sendSuccess(res, "suppliers added successfully", bulk, 201);
    } catch (err) {
      next(err);
    }
}
}
