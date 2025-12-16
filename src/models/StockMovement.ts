// models/StockMovement.ts
import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  Sequelize,
  CreationOptional,
} from "sequelize";

export class StockMovement extends Model<
  InferAttributes<StockMovement>,
  InferCreationAttributes<StockMovement>
> {
  declare id: CreationOptional<number>;
  declare reference: string;
  declare productId: number;
  declare fromType?: string | null;
  declare fromId?: number | null;
  declare toType?: string | null;
  declare toId?: number | null;
  declare quantity: number;
  declare movementType: "in" | "out" | "transfer";
  declare tenantId: string;
  declare performedBy: number;
}

export const initStockMovementModel = (sequelize: Sequelize) => {
  StockMovement.init(
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      reference: { type: DataTypes.STRING, allowNull: false },
      productId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      fromType: { type: DataTypes.STRING, allowNull: true },
      fromId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
      toType: { type: DataTypes.STRING, allowNull: true },
      toId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
      quantity: { type: DataTypes.INTEGER, allowNull: false },
      movementType: { type: DataTypes.ENUM("in", "out", "transfer"), allowNull: false },
      tenantId: { type: DataTypes.STRING, allowNull: false },
      performedBy: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    },
    { tableName: "stock_movements", sequelize, timestamps: true }
  );
};
