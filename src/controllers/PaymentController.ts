import { Request, Response, NextFunction } from "express";
import PaymentService from "../services/PaymentService.js";
import { AppError } from "../utils/AppError.js";
import { sendSuccess } from "../utils/sendSuccess.js";

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

      const payment = await PaymentService.receivePayment(
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
}
