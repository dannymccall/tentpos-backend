
import { RoleService } from "../services/RoleService.js";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";
import { sendSuccess } from "../utils/sendSuccess.js";

interface AuthenticatedRequest extends Request {
  user?: any;
}
export class RoleController {
  private roleService: RoleService;

  constructor() {
    this.roleService = new RoleService();
  }

  public addNewRole = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { name, permissions, description } = req.body;
      const { tenantId } = req.user;

      if (!tenantId) {
        return next(new AppError("User not authenticated", 404));
      }
      if (!name.trim() || !Array.isArray(permissions) || !permissions || permissions.length === 0)  {
        return next(new AppError("All fields are required", 400));
      }

      const newRole = await this.roleService.addNewRole({
        name: name,
        permissions: permissions,
        tenantId,
        description: description
      });

      if (!newRole) {
        return next(new AppError("Role creation failed, try again"));
      }

      return sendSuccess(
        res,
        "Role added successfully",
        newRole,
        201
      );
    } catch (error) {
      next(error);
    }
  };

  public getRoles = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { page, limit, searchTerm } = req.query;
      const {tenantId} = req.user;

      const roles = await this.roleService.getRoles(
        Number(page),
        Number(limit),
        tenantId,
        searchTerm as string
      );
      return sendSuccess(res, "", roles);
    } catch (error) {
      next(error);
    }
  };

  public getRole = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.query;
      if (!id) {
        return next(new AppError("Invalid request", 400));
      }

      const permission = await this.roleService.getRole(Number(id));

      return sendSuccess(res, "", permission);
    } catch (error) {
      next(error);
    }
  };


  public deleteRole = async (req: AuthenticatedRequest, res:Response, next:NextFunction) => {
    const {id} = req.query;
    const {tenantId} = req.user;

    if(!id){
      return next(new AppError("Invalid Request", 400))
    }

    if(!tenantId){
      return next(new AppError("Something happened, please try again"))
    }

    try{
      const role = await this.roleService.getRole(Number(id));

      if(!role){
        return next(new AppError("Role not found", 404));
      }

      const deletedRole = await role.destroy();

      return sendSuccess(res, "Role deleted successfully")
    }catch(error){
      next(error)
    }
  }
  public updateRole = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { name, permissions, description,id } = req.body;
      console.log(req.body)
      const { tenantId } = req.user;
      if (!tenantId) {
        return next(new AppError("User not authenticated", 404));
      }
      if (!name.trim() || !Array.isArray(permissions) || !permissions || permissions.length === 0)  {
        return next(new AppError("All fields are required", 400));
      }

      if(!id || typeof id !== "number"){
        return next(new AppError("Invalid request", 400))
      }

      const newRole = await this.roleService.updateRole(Number(id),{
        name: name,
        permissions: permissions,
        tenantId,
        description: description
      });

      if (!newRole) {
        return next(new AppError("Role creation failed, try again"));
      }

      return sendSuccess(
        res,
        "Role updated successfully",
        newRole,
        201
      );
    } catch (error) {
      next(error);
    }
  };

}
