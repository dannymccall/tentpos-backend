import { NextFunction, Response, Request } from "express";
import { BranchService } from "../services/BranchService.js";
import { Branch } from "../models/Branch.js";

import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { sendSuccess } from "../utils/sendSuccess.js";
import { generateBranchCode } from "../utils/helperFunctions.js";
// import { AuditLogRepository } from "../repositories/AuditLogRepository.js";

interface AuthenticatedRequest extends Request {
  user?: any;
}
export class BranchController {
  private branchService: BranchService;

  constructor() {
    this.branchService = new BranchService();
  }

  public createBranch = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { tenantId } = req.user;
      const { name, address, city, region, phone, email, managerId } = req.body;

      // Fetch last branch for code generation
      const lastBranch = await Branch.findOne({
        where: { tenantId },
        order: [["createdAt", "DESC"]],
      });

      const userId = managerId ? Number(managerId) : null;

      // Validate manager if provided
      if (userId) {
        const user = await User.findByPk(userId);
        if (!user) {
          return next(new AppError("Selected manager does not exist", 404));
        }
      }

      // Generate branch code
      const nextCode = generateBranchCode(lastBranch?.code);

      // Create branch
      const branch = await this.branchService.addBranch({
        tenantId,
        name,
        code: nextCode,
        address,
        city,
        region,
        phone,
        email,
      });

      let newBranchManager;
      // Assign manager if provided
      // if (userId) {
      //   newBranchManager = await BranchManager.create({
      //     userId,
      //     branchId: branch.id,
      //     tenantId,
      //   });
      // }

      // if (newBranchManager && branch) {
      //   await branch.update!({
      //     managerId: newBranchManager.id,
      //   });
      // }
      // await AuditLogRepository.createLog({
      //   tenantId: tenantId,
      //   branchId: branch.id,
      //   userId: req.user.userId,
      //   description: `Created branch ${branch.name}`,
      //   action: "CREATE_BRANCH",
      //   timestamp: new Date(),
      //   entity: "Branch",
      //   entityId: branch.id,
      // });

      return sendSuccess(
        res,
        userId
          ? "Branch created successfully and manager assigned"
          : "Branch created successfully",
        branch,
        201
      );
    } catch (error) {
      next(error);
    }
  };

  public getBranches = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    const { tenantId } = req.user;

    try {
      const { page, limit, searchTerm } = req.query;
      // const pageParam = parseInt(page || "1", 10);
      // const limitParam = parseInt(limit || "10", 10);
      const roles = await this.branchService.getBranches(
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

  public deleteBranch = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    const { id } = req.query;
    const { tenantId } = req.user;

    console.log({ id });
    if (!id) {
      return next(new AppError("Invalid Request", 400));
    }

    try {
      const role = await this.branchService.getBranch(Number(id));

      if (!role) {
        return next(new AppError("Role not found", 404));
      }

      const deletedRole = await role.destroy();

      // await AuditLogRepository.createLog({
      //   tenantId: tenantId,
      //   branchId: parseInt(id as string),
      //   userId: req.user.userId,
      //   description: `Deleted branch ${role.name}`,
      //   action: "DELETE_BRANCH",
      //   timestamp: new Date(),
      //   entity: "Branch",
      //   entityId: req.user.userId,
      // });
      return sendSuccess(res, "Role deleted successfully", deletedRole);
    } catch (error) {
      next(error);
    }
  };
  public updateBranch = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    const { tenantId } = req.user;

    const { name, address, code, city, region, phone, email, id } = req.body;

    if (!id || typeof id !== "number") {
      return next(new AppError("Invalid request", 400));
    }
    try {
      const branch = await this.branchService.updateBranch(Number(id), {
        tenantId,
        name,
        code,
        address,
        city,
        region,
        phone,
        email,
      });
      // await AuditLogRepository.createLog({
      //   tenantId: tenantId,
      //   branchId: branch?.id,
      //   userId: req.user.userId,
      //   description: `Updated branch ${branch?.name}`,
      //   action: "UPDATE_BRANCH",
      //   timestamp: new Date(),
      //   entity: "Branch",
      //   entityId: branch?.id,
      // });
      return sendSuccess(res, "Branch updated successfully", branch, 201);
    } catch (error) {
      next(error);
    }
  };
}
