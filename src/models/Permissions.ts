// models/RolePermission.ts
import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  Sequelize,
  ForeignKey,
  CreationOptional,
} from "sequelize";

export class RolePermission extends Model<
  InferAttributes<RolePermission>,
  InferCreationAttributes<RolePermission>
> {
  declare id: CreationOptional<number>;
  declare permission_name: string;
  declare code_name: string;
  declare description:string;
  declare category:string;
}

export const initRolePermissionModel = (sequelize: Sequelize) => {
  RolePermission.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      permission_name: { type: DataTypes.STRING, allowNull: false },
      code_name: { type: DataTypes.STRING, allowNull: false },
      description: {type: DataTypes.STRING, allowNull:false},
      category:{type: DataTypes.STRING, allowNull:false}
    },
    { tableName: "role_permissions", sequelize, timestamps: true }
  );
};
