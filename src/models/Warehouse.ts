// models/Warehouse.ts
import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  Sequelize,
  CreationOptional,
  ForeignKey,
} from "sequelize";
import { Branch } from "./Branch.js"; // optional link if warehouse belongs to branch sometimes

export class Warehouse extends Model<
  InferAttributes<Warehouse>,
  InferCreationAttributes<Warehouse>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare description?: string | null;
  declare tenantId: string;
  declare location?: string | null;
  declare createdBy: number; // userId
}

export const initWarehouseModel = (sequelize: Sequelize) => {
  Warehouse.init(
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      tenantId: { type: DataTypes.STRING, allowNull: false },
      location: { type: DataTypes.STRING, allowNull: true },
      createdBy: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    },
    { tableName: "warehouses", sequelize, timestamps: true }
  );
};
