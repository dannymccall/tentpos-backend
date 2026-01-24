import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";
import { sendSuccess } from "../utils/sendSuccess.js";
import paymentService from "../services/PaymentService.js"
export class PaymentController {
  public async receivepayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenantId, branchId, userId } = (req as any).user;

      const { amount, method, customerId } = req.body;

      if (
        !amount ||
        (isNaN(amount) && !method && !customerId) ||
        isNaN(customerId)
      ) {
        return next(new AppError("Invalid payment details", 404)) ;
      }

      const payment = await paymentService.receivePayment(
        amount,
        customerId,
        method,
        userId,
        tenantId,
        branchId
      );

      if(payment.status === "error"){
        return next(new AppError(payment.message))
      }

      return sendSuccess(res, payment.message, payment, 201)
    } catch (error) {
      next(error);
    }
  }

    public async list(req: Request, res: Response, next: NextFunction) {
      try {
        const baseWhere = {};
        const where = (req as any).applyDataScope("sales", baseWhere);
        const page = Number(req.query.page);
        const limit = Number(req.query.limit);
        const search = String(req.query.searchTerm || "");
        const customerId = Number(req.query.customerId)
        const sales = await paymentService.getPayments(page, limit, search, where, customerId);
        return sendSuccess(res, "", sales, 200);
      } catch (err) {
        next(err);
      }
    }
}
