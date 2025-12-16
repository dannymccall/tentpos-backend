// models/UserRole.ts (Join Table)
import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  Sequelize,
  ForeignKey,
  CreationOptional,
} from "sequelize";
import { User } from "./User.js";
import { Role } from "./Role.js";

export class UserRole extends Model<
  InferAttributes<UserRole>,
  InferCreationAttributes<UserRole>
> {
  declare id: CreationOptional<number>;
  declare userId: ForeignKey<User["id"]>;
  declare roleId: ForeignKey<Role["id"]>;
  declare tenantId: string;
  declare role?: Role
}

export const initUserRoleModel = (sequelize: Sequelize) => {
  UserRole.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      roleId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      tenantId: { type: DataTypes.STRING, allowNull: false },
    },
    { tableName: "user_roles", sequelize, timestamps: true }
  );
};
