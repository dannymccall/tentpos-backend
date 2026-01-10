import { NextFunction, Request, Response } from "express";
import { ENV } from "../config/env.js";

import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { sendSuccess } from "../utils/sendSuccess.js";
import api from "../utils/api.js";
import { signServiceJWT } from "../utils/helperFunctions.js";
import FormData from "form-data";
import fs from "fs";
import fetch from "node-fetch"

export class TicketController {
  public async createTicket(req: Request, res: Response) {
    try {
      const files = req.files as Record<string, Express.Multer.File[]>;
      console.log("Files received:", files); // <-- check this in your logs
      console.log("Body:", req.body);

      // Now forward to AppCenter
      const payload = new FormData();
      Object.entries(req.body).forEach(([key, value]) => {
        payload.append(key, value as string);
      });

      // Append files
      files?.attachments?.forEach((file) => {
        payload.append("attachments", fs.createReadStream(file.path,), {
          filename: file.originalname,
          knownLength: file.size,
        });
      });

      const secret = signServiceJWT(
        ENV.TENTPOS_APP_ID,
        (req as any).user.tenantId,
        (req as any).user.staffId,
        ["support:write"]
      );

      const response = await fetch(
        `${ENV.TENTHUB_APP_CENTER_URL}/api/internal/support/tickets`,
        {
          method: "POST",
          body: payload as any,
          headers: {
            Authorization: `Bearer ${secret}`,
            ...payload.getHeaders(), // required for FormData
          },
        }
      );

      const data = await response.json() as { message?: string };
      if (!response.ok) throw new Error((data as any).message || "AppCenter error");

      return res.status(201).json({ status: "success", data });
    } catch (error: any) {
      console.error("Ticket creation failed:", error);
      return res.status(500).json({ status: "error", message: error.message });
    }
  }

  public fetchTickets = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { role, staffId, tenantId } = (req as any).user;
      const where = (req as any).applyDataScope("tickets", {});
      const { userId, branchId } = where;

      let user;
      if (userId) {
        user = await User.findOne({ where: { id: userId } });
      }

      console.log({ user });
      const whereCondition: Record<string, any> = {
        tenantId,
        appId: ENV.TENTPOS_APP_ID,
      };

      if (userId && role === "client-user") {
        whereCondition.createdByClientUserId = user?.userId;
      }

      if (branchId && role === "client-user") {
        whereCondition.branchId = branchId;
      }

      const secret = signServiceJWT(ENV.TENTPOS_APP_ID, tenantId, staffId, [
        "support:read",
      ]);

      const queryString = new URLSearchParams({
        ...(req.query as Record<string, string>),
        where: JSON.stringify(whereCondition),
      }).toString();

      const response = await fetch(
        `${ENV.TENTHUB_APP_CENTER_URL}/api/internal/support/tickets?${queryString}`,
        {
          headers: {
            Authorization: `Bearer ${secret}`,
            "Content-Type": "application/json",
          },
        }
      );

      // console.log(response)

      const data = await response.json() as { status?: string; message?: string; data?: any };
      console.log(data);
      if (!response.ok || data.status === "error") {
        throw new AppError(data.message || "Failed to fetch tickets", 400);
      }

      return sendSuccess(res, "Tickets fetched", data.data);
    } catch (error) {
      next(error);
    }
  };

  public fetchTicket = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { tenantId, staffId } = (req as any).user;
      const { ticketId } = req.query;
      const secret = signServiceJWT(ENV.TENTPOS_APP_ID, tenantId, staffId, [
        "support:read",
      ]);

      const response = await fetch(
        `${
          ENV.TENTHUB_APP_CENTER_URL
        }/api/internal/support/ticket?ticketId=${Number(ticketId)}`,
        {
          headers: {
            Authorization: `Bearer ${secret}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json() as { status?: string; message?: string; data?: any };

      if (!response.ok || data.status === "error") {
        return next(
          new AppError(
            data.message || "Unable to fetch ticket",
            response.status
          )
        );
      }

      return sendSuccess(res, "Ticket fetched successfully", data.data);
    } catch (error) {
      next(error);
    }
  };

  public updateStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.query;
      const { tenantId, staffId } = (req as any).user;
      const status = req.body.status;
      const secret = signServiceJWT(ENV.TENTPOS_APP_ID, tenantId, staffId, [
        "support:update",
      ]);

      const response = await api.put(
        `${
          ENV.TENTHUB_APP_CENTER_URL
        }/api/internal/support/ticket?ticketId=${Number(id)}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${secret}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status !== "success") {
        return next(new AppError("Something happened, please try again"));
      }

      return sendSuccess(res, response.message, response.data);
    } catch (error) {
      next(error);
    }
  };
  public sendMessage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { ticketId } = req.query;
      console.log({ ticketId });
      const { tenantId, staffId, email } = (req as any).user;
      const message = req.body.message;
      const secret = signServiceJWT(ENV.TENTPOS_APP_ID, tenantId, staffId, [
        "support:message",
      ]);

      const response = await api.post(
        `${
          ENV.TENTHUB_APP_CENTER_URL
        }/api/internal/support/tickets/message?ticketId=${Number(ticketId)}`,
        { message, email },
        {
          headers: {
            Authorization: `Bearer ${secret}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status !== "success") {
        return next(new AppError("Something happened, please try again"));
      }

      return sendSuccess(res, response.message, response.data);
    } catch (error) {
      next(error);
    }
  };
}
