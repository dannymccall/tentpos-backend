import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  Sequelize,
  CreationOptional,
} from "sequelize";

export type DataScopeType = "personal" | "assigned" | "all" | "none";

export type EntityScope = {
  entity: string;
  scope: DataScopeType;
};

export class RoleDataScope extends Model<
  InferAttributes<RoleDataScope>,
  InferCreationAttributes<RoleDataScope>
> {
  declare id: CreationOptional<number>;
  declare roleId: number;
  declare tenantId: string;
  declare scopes: EntityScope[];
}

export const initRoleDataScopeModel = (sequelize: Sequelize) => {
  RoleDataScope.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      roleId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      tenantId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      scopes: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
      },
    },
    { tableName: "role_data_scopes", sequelize }
  );
};
