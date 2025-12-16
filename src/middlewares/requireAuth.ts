import { Request, Response, NextFunction } from "express";
import { ENV } from "../config/env.js";
import { Session } from "../models/Session.js";
import { User } from "../models/User.js";
import { UserRole } from "../models/UserRoles.js";
import { AppError } from "../utils/AppError.js";
interface AuthenticatedUser extends Request {
  user?: any;
}
export async function requireAuth(
  req: AuthenticatedUser,
  res: Response,
  next: NextFunction
) {
  try {
    const { accessToken } = req.user || {};
    const sessionId = req.headers.authorization?.split(" ")[1];

    const session = await Session.findOne({where: {sessionId: sessionId}});
    if (!accessToken && !sessionId) {
      return next(new AppError("Access token or session ID is missing", 401));
    }

    if(!session){
        return next(new AppError("Invalid session", 404))
    }

    const tokenToVerify = accessToken || sessionId;

    // Send the token/sessionId for verification
    const response = await fetch(`${ENV.TENTHUB_APP_CENTER_URL}/api/oauth/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ accessToken:accessToken, refreshToken: session.refreshTokenHash }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        message: accessToken ? "Access token verification failed" : "Session verification failed",
        error: err,
      });
    }

    const data = await response.json();
    const user = await User.findOne({where: {email: data.data.email}});
    const userRole = await UserRole.findOne({where: {userId: user?.id}});
    req.user = {
      userId: user?.id,
      tenantId: data.data.tenantId,
      accessToken: data.data.accessToken, // match your actual key name
      role: data.data.role,
      branchId: user?.branchId,
      appRole:user?.appRole,
      staffId:data.data.userId,
      roleId: userRole?.roleId,
      email: data.data.email,

    };

    return next();
  } catch (error) {
    console.error(error);
    return next(new AppError("Authentication failed", 500));
  }
}
