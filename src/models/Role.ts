// models/Role.ts
import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  Sequelize,
  CreationOptional,
} from "sequelize";

type Permission = {
  code_name: string;
  name: string;
  category: string;
};
export class Role extends Model<
  InferAttributes<Role>,
  InferCreationAttributes<Role>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare permissions: Permissions[];
  declare tenantId: string;
  declare description:string;
}


export const initRoleModel = (sequelize: Sequelize) => {
  Role.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      name: { type: DataTypes.STRING, allowNull: false },
      permissions: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
      tenantId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type:DataTypes.STRING,
        allowNull:false
      }
    },
    { tableName: "roles", sequelize }
  );
};
