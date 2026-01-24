
import { Branch } from "../models/Branch.js";
import { Role } from "../models/Role.js";
import { User } from "../models/User.js";
import { UserRole } from "../models/UserRoles.js";
import { UserService } from "../services/UserService.js";
import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../utils/sendSuccess.js";
import { AppError } from "../utils/AppError.js";

interface AuthenticatedRequest extends Request {
  user?: any;
}
export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  public addUser = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { fullName, tenantId, appRole, userId, email } = req.body;
      console.log(req.body)
      let user = await User.findOne({ where: { email, tenantId } });
      if (user) {
        return res.status(200).json({ message: "User already exists", user });
      }
      user = await User.create({
        userId: userId, // foreign reference to TentHub
        email,
        appRole,
        tenantId,
        fullName,
      });

      return res.status(201).json({ message: "User provisioned", user });
    } catch (err: any) {
      console.error("Provisioning error:", err);
      return res.status(500).json({ error: "Failed to provision user" });
    }
  };
  public getUsers = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    const { tenantId } = req.user;
    console.log({tenantId})
    const { page, limit, searchTerm } = req.query;
    const baseWhere = {}
    const where = (req as any).applyDataScope("users",baseWhere)
    console.log(req.user)
    try {
      const users = await this.userService.getUsers(
        Number(page),
        Number(limit),
        where,
        searchTerm as string
      );

      console.log({users})
      return sendSuccess(res, "", users);
    } catch (error) {
      next(error);
    }
  };

  public updateUser = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    const { appRole, fullName, id, role, tenantId, userId, branchId } =
      req.body;
    console.log({ branchId });
    try {
      const user = await this.userService.getUser(id);
      if (!user) {
        return next(new AppError("User not found", 404));
      }

      // Validate branch
      const branch =
        branchId && (await Branch.findOne({ where: { id: Number(branchId) } }));
      console.log({ branch });
      if (branchId && !branch) {
        return next(new AppError("Branch does not exist"));
      }

      // Update user basic info
      const updatedUser = await this.userService.updateUser(id, {
        fullName,
        appRole,
        userId,
        branchId: branchId ? Number(branchId) : null,
      });

      if (!updatedUser) {
        return next(new AppError("User update failed"));
      }

      // Handle role assignment
      if (role) {
        // Find existing UserRole for this user
        let userRole = await UserRole.findOne({ where: { userId: id } });

        if (userRole) {
          // Update existing role
          await userRole.update({ roleId: role });
        } else {
          // Create a new UserRole link
          await UserRole.create({
            userId: id,
            roleId: role,
            tenantId,
          });
        }
      }

      return sendSuccess(res, "User updated successfully");
    } catch (error) {
      next(error);
    }
  };

  public getStaffDetails = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { staffId } = req.query;
      const tenantId = (req as any).user.tenantId
      console.log({staffId})
      const staffDetails = await this.userService.getUserDetails(
        parseInt(staffId as string),
        tenantId
      );
      console.log({staffDetails});

      return sendSuccess(res, "", staffDetails, 200);
    } catch (error) {
      next(error);
    }
  };
}
