import { Request, Response, NextFunction } from "express";
import { User } from "../models/User.js";
import { UserRole } from "../models/UserRoles.js";
import { Role } from "../models/Role.js";


export const RequirePermission = (permissionCode: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const email = (req as any).user.email as number;
    const appRole = (req as any).user.appRole as string;

    if (!email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findOne({
      where: { email: email }, 
      include: {
        model: UserRole,
        as: "userRole",
        include: [
          {
            model: Role,
            as: "role",
          },
        ],
      },
    });


    const role = user?.userRole?.role;
    const permissions = role?.permissions.map(
      (permission:any ) => permission.code_name
    );


    if (appRole !== "owner" && !permissions?.includes(permissionCode)) {
      return res
        .status(403)
        .json({ message: "Forbidden: Missing permission " + permissionCode });
    }


    next();
  };
};
