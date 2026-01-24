import { Model, DataTypes } from "sequelize";
import type { InferAttributes, InferCreationAttributes, NonAttribute, Sequelize } from "sequelize";
import { PurchaseItem } from "./PurchaseItem.js";

export class Purchase extends Model<InferAttributes<Purchase>, InferCreationAttributes<Purchase>> {
  declare id: number;
  declare supplierId?: number | null;
  declare receiptNumber?: string | null;
  declare purchaseDate?: Date | null;
  declare status: "draft" | "completed" | "cancelled";
  declare subtotal: number;
  declare tax: number;
  declare discount: number;
  declare total: number;
  declare amountPaid: number;
  declare balance: number;
  declare notes?: string | null;
  declare createdAt?: Date;
  declare updatedAt?: Date;
  declare items?: NonAttribute<PurchaseItem[]>
  declare tenantId: string
}

export function initPurchaseModel (sequelize: Sequelize){

    Purchase.init(
      {
        id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
        supplierId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
        receiptNumber: { type: DataTypes.STRING(100), allowNull: true },
        purchaseDate: { type: DataTypes.DATEONLY, allowNull: true },
        status: { type: DataTypes.ENUM("draft", "completed", "cancelled"), allowNull: false, defaultValue: "draft" },
        subtotal: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        tax: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        discount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        total: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        amountPaid: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        balance: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
        notes: { type: DataTypes.TEXT, allowNull: true },
        tenantId: {type: DataTypes.STRING, allowNull:false}
      },
      { sequelize: sequelize, tableName: "purchases", timestamps: true }
    );
}


