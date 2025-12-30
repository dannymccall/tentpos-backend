import saleService from "../services/SaleService.js";
import { Request, Response, NextFunction } from "express";
import {  ReturnDtoSchema, saleSchema } from "../utils/definitions.js";
import { AppError } from "../utils/AppError.js";
import SaleService from "../services/SaleService.js";
import { sendSuccess } from "../utils/sendSuccess.js";

class SaleController {
  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      console.log(req.body);
      const { tenantId, branchId, userId } = (req as any).user;
      const parsed = saleSchema.safeParse(req.body);

      if (!parsed.success) {
        console.log(parsed.error.flatten());
        return next(new AppError("Invalid sales details"));
      }

      const sale = await SaleService.createSale({
        ...(parsed.data as any),
        tenantId,
        branchId,
        userId,
        holdSale: req.body.holdSale,
      });

      if (sale.status === "error") {
        return next(new AppError(sale.message!));
      }

      return sendSuccess(
        res,
        "Sale created Successfully",
        { sale: sale.newSale, invoice: sale.invoice },
        201
      );
    } catch (err) {
      console.log(err)
      next(err);
    }
  }

  public async list(req: Request, res: Response, next: NextFunction) {
    try {
      const baseWhere = {};
      const where = (req as any).applyDataScope("sales", baseWhere);
      const page = Number(req.query.page);
      const limit = Number(req.query.limit);
      const search = String(req.query.searchTerm || "");
      const status = String(req.query.status || "");
      const sales = await saleService.list(page, limit, search, where, status);
      return sendSuccess(res, "", sales, 200);
    } catch (err) {
      next(err);
    }
  }

  public async get(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.query.id);
      const s = await saleService.get(id);
      if (!s) return next(new AppError("Not found", 404));

      return sendSuccess(res, "", s, 200);
    } catch (err) {
      next(err);
    }
  }
  public async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.query.id);
      const s = await saleService.cancelSale(id);

      if (s.status === "error") {
        return next(new AppError(s.message));
      }
      return sendSuccess(res, "Sales cancelled successfully", s, 200);
    } catch (err) {
      next(err);
    }
  }

  public async getInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const baseWhere = {};
      const where = (req as any).applyDataScope("sales", baseWhere);
      const page = Number(req.query.page);
      const limit = Number(req.query.limit);
      const search = String(req.query.searchTerm || "");
      const invoices = await saleService.getInvoices(
        page,
        limit,
        search,
        where
      );
      return sendSuccess(res, "", invoices, 200);
    } catch (err) {
      next(err);
    }
  }

  public async processReturnSale(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const parsed = ReturnDtoSchema.safeParse(req.body);
      const userId = (req as any).user.userId;
      if (!parsed.success) {
       console.log(parsed.error.flatten());
       return next(new AppError("Invalid return details", 400))
      }

      const returnSale = await saleService.returnSale(parsed.data, userId);

      if (returnSale.status === "error") {
        return next(
          new AppError("Failed to process sale return, please try again later")
        );
      }

      return sendSuccess(res, "Sale return processed successfully", {}, 201);
    } catch (error) {
      next(error);
    }
  }

   public async getSaleReturns(req: Request, res: Response, next: NextFunction) {
    try {
      const baseWhere = {};
      const where = (req as any).applyDataScope("sales", baseWhere);
      const page = Number(req.query.page);
      const limit = Number(req.query.limit);
      const search = String(req.query.searchTerm || "");
      const invoices = await saleService.getSaleReturn(
        page,
        limit,
        search,
        where
      );
      return sendSuccess(res, "", invoices, 200);
    } catch (err) {
      next(err);
    }
  }

  public async completeHoldSale (req: Request, res:Response, next: NextFunction){
    try{
      const {tenantId, userId,branchId} = (req as any).user;
      const result = await saleService.completeHoldSale({...req.body, tenantId, userId, branchId})
       return sendSuccess(
        res,
        "Sale completed Successfully",
        { sale: result.sale, invoice: result.invoice },
        201
      );
    }catch(error){
      next(error)
    }
  }
}

export default new SaleController();
