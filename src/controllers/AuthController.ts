import { Response, Request, NextFunction } from "express";
import { ENV } from "../config/env.js";
import { SessionService } from "../services/SessionService.js";
import { Session } from "../models/Session.js";
import { UserService } from "../services/UserService.js";
import { AppProfileSettings } from "../models/AppProfileSettings.js";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { sendSuccess } from "../utils/sendSuccess.js";
import api from "../utils/api.js";
interface AuthenticatedRequest extends Request {
  user?: any;
}
export class AuthController {
  private sessionService: SessionService;
  private userService: UserService;
  constructor() {
    this.sessionService = new SessionService();
    this.userService = new UserService();
  }

  public exchange = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { code } = req.body;
      if (!code) {
        return next(new AppError("Missing authorization code", 400));
      }

      const tokenRes = await api.post(
        `${ENV.TENTHUB_APP_CENTER_URL}/api/oauth/token`,
        {
          client_id: ENV.TENTPOS_APP_ID,
          client_secret: ENV.TENTPOS_APP_SECRET,
          code,
          redirect_url: `${ENV.REDIRECT_URL}/auth/callback`,
          grant_type: "authorization_code",
        }
      );

      // Generate a unique sessionId for TentCredit
      const sessionId = SessionService.generateSessionIdWithSalt(
        tokenRes.userId
      );

      // Use upsert to avoid duplicate entry errors
      await this.sessionService.createSession({
        email: tokenRes.email,
        refreshTokenHash: tokenRes.refresh_token, // keep as plain text for now
        sessionId,
      });

      // Attach user context to the request
      req.user = {
        userId: tokenRes.userId,
        tenantId: tokenRes.tenantId,
        accessToken: tokenRes.access_token,
        role: tokenRes.role,
        email: tokenRes.email,
      };
      // await AuditLogRepository.createLog({
      //   tenantId: tokenRes.tenantId,
      //   branchId: null,
      //   userId: tokenRes.userId,
      //   description: `User logged in via code exchange ${tokenRes.userId}`,
      //   action: "LOGIN",
      //   timestamp: new Date(),
      //   entity: "Authentication",
      //   entityId: tokenRes.userId,
      // });

      const companyRole = tokenRes.role === "client-admin" ? "owner" : "user";

      const response = await api.get(
        `${ENV.TENTHUB_APP_CENTER_URL}/api/oauth/me?email=${tokenRes.email}`
      );

      // console.log({response})

      const businessProfile = await this.userService.getUserBusinessProfile(
        tokenRes.email,
        companyRole,
        tokenRes.tenantId
      );
      //
      // console.log({businessProfile})

      const settings = await AppProfileSettings.findOne({
        where: { tenantId: tokenRes.tenantId },
      });
      return sendSuccess(res, "", {
        ...response,
        businessProfile,
        settings,
        sessionId,
      });
    } catch (error) {
      console.log(error);
      return next(
        new AppError("Something went wrong during code exchange", 500)
      );
    }
  };

  public getMe = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { userId, role, tenantId, email } = req.user;
      console.log("user: ", req.user);
      const companyRole = role === "client-admin" ? "owner" : "user";
      if (!userId) {
        throw new AppError("Session ID not provided", 404);
      }

      try {
        const response = await api.get(
          `${ENV.TENTHUB_APP_CENTER_URL}/api/oauth/me?email=${email}`
        );

        // console.log({response})

        const businessProfile = await this.userService.getUserBusinessProfile(
          email,
          companyRole,
          tenantId
        );
        //
        // console.log({businessProfile})

        const settings = await AppProfileSettings.findOne({
          where: { tenantId },
        });
        return sendSuccess(res, "", { ...response, businessProfile, settings });
      } catch (error) {
        next(error);
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

  public signout = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { userId, tenantId, branchId, email } = req.user;

      if (!userId) {
        return next(new AppError("Session ID not provided", 404));
      }

      const session = await Session.findOne({ where: { email: email } });

      if (!session) {
        return next(new AppError("User not Signed in", 400));
      }

      const response = await api.post(
        `${ENV.TENTHUB_APP_CENTER_URL}/api/oauth/signout?email=${email}`
      );
      console.log({ response });

      if (response.status !== "success") {
        return next(new AppError("Something happened", 400));
      }

      await session.destroy();

      //    await AuditLogRepository.createLog({
      //     tenantId: tenantId,
      //     branchId: branchId,
      //     userId: userId,
      //     description: `LOGOUT ${userId}`,
      //     action: "LOGOUT",
      //     timestamp: new Date(),
      //     entity: "Authentication",
      //     entityId: userId,
      //   });
      return sendSuccess(res, "", response || null);
    } catch (error) {
      next(error);
    }
  };
}
