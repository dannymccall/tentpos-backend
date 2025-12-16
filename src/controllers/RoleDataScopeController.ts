import { RoleDataScopeService } from "../services/RoleDataScopeService.js";
import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../utils/sendSuccess.js";

export class RoleDataScopeController {
  private roleDataScopeService: RoleDataScopeService;

  constructor() {
    this.roleDataScopeService = new RoleDataScopeService();
  }

  public addRoleDataScope = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const tenantId = (req as any).user.tenantId;
      const { roleId, scopes } = req.body;
      const roleData = await this.roleDataScopeService.addRoleDataScope({
        tenantId,
        roleId,
        scopes,
      });
      return sendSuccess(res, "", roleData, 201);
    } catch (error) {
      next(error);
    }
  };

  public getRoleDataScope = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { roleId } = req.query;
      const scope = await this.roleDataScopeService.getRoleDataScope(
        Number(roleId)
      );
      return sendSuccess(res, "", scope, 200);
    } catch (error) {
      next(error);
    }
  };
}
