
import { PermissionService } from "../services/PermissionService.js";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";
import { sendSuccess } from "../utils/sendSuccess.js";

interface AuthenticatedRequest extends Request {
  user?: any;
}
export class PermissionController {
  private permissionService: PermissionService;

  constructor() {
    this.permissionService = new PermissionService();
  }

  public addNewPermission = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { name, code_name } = req.body;
      const { tenantId } = req.user;

      if (!tenantId) {
        return next(new AppError("User not authenticated", 404));
      }
      if (!name.trim() || !code_name.trim()) {
        return next(new AppError("All fields are required", 400));
      }

      const newPermission = await this.permissionService.addNewPermission({
        ...req.body,
        tenantId,
      });

      if (!newPermission) {
        return next(new AppError("Permission creation failed, try again"));
      }

      return sendSuccess(
        res,
        "Permission added successfully",
        newPermission,
        201
      );
    } catch (error) {
      next(error);
    }
  };

  public getPermissions = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { page, limit } = req.query;

      const permissions = await this.permissionService.getPermissions(
        Number(page),
        Number(limit)
      );
      console.log(permissions)
      return sendSuccess(res, "", permissions);
    } catch (error) {
      next(error);
    }
  };

  public getPermission = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.query;
      if (!id) {
        return next(new AppError("Invalid request", 400));
      }

      const permission = await this.permissionService.getPermission(Number(id));

      return sendSuccess(res, "", permission);
    } catch (error) {
      next(error);
    }
  };
}
