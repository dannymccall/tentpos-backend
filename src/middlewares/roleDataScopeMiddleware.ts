import { Request, Response, NextFunction } from "express";
import { RoleDataScope } from "../models/RoleDataScope.js";

export async function roleDataScopeMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req as any).user;
    if (!user) return next();

    // 🟢 OWNER OVERRIDE
    if (user.appRole === "owner") {
      // Full unrestricted access
      // (req as any).roleDataScope = "owner";

      (req as any).applyDataScope = (_entity: string, baseWhere = {}) => {
        return {
          ...baseWhere,
          tenantId: user.tenantId, // owner sees everything in the tenant
        };
      };

      return next();
    }

    // 🛑 If there's no roleId, avoid any database lookup and deny everything
    if (!user.roleId) {
      (req as any).roleDataScope = [];

      (req as any).applyDataScope = (_entity: string, baseWhere = {}) => {
        // No role → No access
        return { ...baseWhere, userId: null };
      };

      return next();
    }

    // 🔵 Normal role-based data scope
    const roleScope = await RoleDataScope.findOne({
      where: { roleId: user.roleId, tenantId: user.tenantId },
    });

    (req as any).roleDataScope = roleScope?.scopes || [];

    (req as any).applyDataScope = (entity: string, baseWhere = {}) => {
      const entry = ((req as any).roleDataScope || []).find(
        (s: any) => s.entity === entity
      );
      const scope = entry?.scope || "none";

      switch (scope) {
        case "personal":
          return { ...baseWhere, userId: user.userId };

        case "branch":
          return { ...baseWhere, branchId: user.branchId };

        case "all":
          return { ...baseWhere, tenantId: user.tenantId };

        case "none":
          return { ...baseWhere, userId: null };

        default:
          return { ...baseWhere, tenantId: user.tenantId };
      }
    };

    next();
  } catch (err) {
    next(err);
  }
}
