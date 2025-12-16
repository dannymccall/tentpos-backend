import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from "sequelize";

export class SaleReturn extends Model<
  InferAttributes<SaleReturn>,
  InferCreationAttributes<SaleReturn>
> {
  declare id: CreationOptional<number>;
  declare saleId: number;
  declare tenantId: string;
  declare branchId: number;
  declare totalRefund: number;
  declare refundMethod: "CASH" | "MOMO" | "BANK" | "STORE_CREDIT";
  declare reason: string;
  declare note?: string | null;
  declare userId: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}
export function initSaleReturnModel(sequelize: Sequelize) {
  SaleReturn.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },

      saleId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },

      tenantId: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      branchId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },

      totalRefund: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },

      refundMethod: {
        type: DataTypes.ENUM("CASH", "MOMO", "BANK", "STORE_CREDIT"),
        allowNull: false,
      },

      reason: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      note: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },

      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      tableName: "sale_returns",
      timestamps: true,
    }
  );
}
