import { Request, Response, NextFunction } from "express";
import { ENV } from "../config/env.js";
import jwt from "jsonwebtoken"
/**
 * Middleware to verify TentHub signed JWT
 */

export function verifyTentHubToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, ENV.APP_PROVISIONING_SECRET) as any;

    // extra safety: check issuer
    if (decoded.issuedBy !== "tenthub") {
      return res.status(403).json({ error: "Invalid issuer" });
    }

    (req as any).decodedTentHub = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
}
