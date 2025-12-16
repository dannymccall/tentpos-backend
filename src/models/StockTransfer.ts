// models/StockTransfer.ts
import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  Sequelize,
  CreationOptional,
  ForeignKey,
} from "sequelize";

export class StockTransfer extends Model<
  InferAttributes<StockTransfer>,
  InferCreationAttributes<StockTransfer>
> {
  declare id: CreationOptional<number>;
  declare reference: string;
  declare fromLocationType: "warehouse" | "branch";
  declare fromLocationId: number;
  declare toLocationType: "warehouse" | "branch";
  declare toLocationId: number;
  declare productId: number;
  declare quantity: number;
  declare status: "pending" | "approved" | "dispatched" | "received" | "cancelled";
  declare tenantId: string;
  declare createdBy: number;
  declare approvedBy?: number | null;
  declare dispatchedBy?: number | null;
  declare receivedBy?: number | null;
}

export const initStockTransferModel = (sequelize: Sequelize) => {
  StockTransfer.init(
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      reference: { type: DataTypes.STRING, allowNull: false, unique: true },
      fromLocationType: { type: DataTypes.ENUM("warehouse", "branch"), allowNull: false },
      fromLocationId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      toLocationType: { type: DataTypes.ENUM("warehouse", "branch"), allowNull: false },
      toLocationId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      productId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      quantity: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      status: { type: DataTypes.ENUM("pending","approved","dispatched","received","cancelled"), allowNull: false, defaultValue: "pending" },
      tenantId: { type: DataTypes.STRING, allowNull: false },
      createdBy: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      approvedBy: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
      dispatchedBy: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
      receivedBy: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    },
    { tableName: "stock_transfers", sequelize, timestamps: true }
  );
};
