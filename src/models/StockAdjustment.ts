import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Sequelize,
  ForeignKey,
} from "sequelize";
import Product from "./Product.js";
import { User } from "./User.js";

export default class StockAdjustment extends Model<
  InferAttributes<StockAdjustment>,
  InferCreationAttributes<StockAdjustment>
> {
  declare id: number;
  declare productId: ForeignKey<Product["id"]>;
  declare branchId: number;
  declare qtyChange: number; // + or -
  declare reason:
    | "BROKEN"
    | "EXPIRED"
    | "LOST"
    | "FOUND"
    | "CORRECTION"
    | "RESTOCK";
  declare note?: string;
  declare userId: ForeignKey<User["id"]>;
  declare tenantId: string;
  declare createdAt?: Date;
}

export function initStockAdjustmentModel(sequelize: Sequelize) {
  StockAdjustment.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      productId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      branchId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      qtyChange: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      reason: {
        type: DataTypes.ENUM(
          "BROKEN",
          "EXPIRED",
          "LOST",
          "FOUND",
          "CORRECTION",
          "RESTOCK"
        ),
        allowNull: false,
      },
      note: {
        type: DataTypes.STRING,
      },
      userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      tenantId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "stock_adjustments",
      timestamps: true,
      updatedAt: false,
    }
  );
}
