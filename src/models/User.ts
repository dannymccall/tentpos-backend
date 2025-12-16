// models/User.ts
import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  Sequelize,
  ForeignKey,
  CreationOptional,
} from "sequelize";
import { Role } from "./Role.js";
import { UserRole } from "./UserRoles.js";
import { Branch } from "./Branch.js";

export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  declare id: CreationOptional<number>;
  declare fullName: string;
  declare branchId?: ForeignKey<Branch["id"] | null>;
  declare tenantId: string;
  declare userRoleId: ForeignKey<UserRole["id"]>;
  declare appRole?: "owner" | "user";
  declare userId: number;
  declare email:string;
  declare userRole?: UserRole;
}

export const initUserModel = (sequelize: Sequelize) => {
  User.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      fullName: { type: DataTypes.STRING, allowNull: false },
      branchId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
      tenantId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      appRole: {
        type: DataTypes.ENUM("owner", "user"),
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull:false
      }
    },
    { tableName: "users", sequelize, timestamps: true }
  );
};
