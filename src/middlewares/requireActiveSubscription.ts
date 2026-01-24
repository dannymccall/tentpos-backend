import { Request, Response, NextFunction } from "express";
import { ENV } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import api from "../utils/api.js";
export const requireActiveSubscription =
  () => async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = (req as any).user?.tenantId;
      console.log({ tenantId });
      if (!tenantId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const response = await api.post(
        `${ENV.TENTHUB_APP_CENTER_URL}/api/internal/subscriptions/validate`,
        { tenantId },
        {
          headers: {
            Authorization: `Bearer ${process.env.APPCENTER_INTERNAL_KEY}`,
          },
        }
      );

      console.log({ response });

      if (!response.valid) {
        return next(new AppError("Subscription expired"));
      }

      // Attach subscription context if needed
      (req as any).subscription = response.data;

      next();
    } catch (error: any) {
      return next(new AppError(error.message));
    }
  };
