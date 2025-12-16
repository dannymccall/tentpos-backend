import { Model, DataTypes } from "sequelize";
import type {
    ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Sequelize,
} from "sequelize";
import { Purchase } from "./Purchase.js";

export class PurchaseItem extends Model<
  InferAttributes<PurchaseItem>,
  InferCreationAttributes<PurchaseItem>
> {
  declare id: number;
  declare purchaseId: ForeignKey<Purchase['id']>;
  declare productId: number;
  declare quantity: number;
  declare costPrice: number;
  declare total: number;
  declare createdAt?: Date;
  declare updatedAt?: Date;
}
export function initPurchaseItemModel(sequelize: Sequelize) {
  PurchaseItem.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      purchaseId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      productId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      quantity: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
      costPrice: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      total: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
    },
    { sequelize: sequelize, tableName: "purchase_items", timestamps: true }
  );
}
