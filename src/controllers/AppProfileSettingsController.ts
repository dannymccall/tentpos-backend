import { AppProfileSettingsService } from "../services/AppProfileSettingsService.js";
import { Request, Response, NextFunction } from "express";
// import { AuditLogRepository } from "../repositories/AuditLogRepository.js";
import { AppError } from "../utils/AppError.js";
import { sendSuccess } from "../utils/sendSuccess.js";
import { processFile } from "../utils/helperFunctions.js";
import { appProfileSettingsSchema } from "../utils/definitions.js";

interface AuthenticatedRequest extends Request {
  user?: any;
}

export class AppProfileSettingController {
  private appProfileSettingsService = new AppProfileSettingsService();

  public getSettings = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    const { tenantId } = req.user;

    try {
      const settings = await this.appProfileSettingsService.getSettings(
        tenantId
      );

      return sendSuccess(res, "", settings, 200);
    } catch (error) {
      next(error);
    }
  };

  public saveSettings = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    const { tenantId, branchId } = req.user;
    const files = req.file;
    console.log(req.body);
    console.log("files: ", req.file);
    try {
      const parsed = appProfileSettingsSchema.safeParse(req.body);

      if (!parsed.success) {
        console.log(parsed.error.flatten());
        return next(new AppError("Invalid settings details", 400));
      }

      const validData = parsed.data;
      let logo;
      try {
        if (files && files?.filename) {
          console.log("you");
          logo = await processFile(
            files.path,
            tenantId,
            "logos",
            files.originalname
          );
        }
      } catch (error) {
        next(error);
      }

      console.log({ logo });
      const settings = await this.appProfileSettingsService.updateSettings(
        tenantId,
        { ...validData, tenantId, logo: logo?.url }
      );
      // await AuditLogRepository.createLog({
      //   tenantId,
      //   branchId,
      //   userId: req.user.userId,
      //   description: `Updated app profile settings`,
      //   action: "UPDATE_ACCOUNT",
      //   timestamp: new Date(),
      //   entity: "Accountting",
      //   entityId: req.user.userId,
      // });
      return sendSuccess(res, "Settings saved", settings, 201);
    } catch (error) {
      next(error);
    }
  };
}
