import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  Sequelize,
} from "sequelize";

export class SaleReturnItem extends Model<
  InferAttributes<SaleReturnItem>,
  InferCreationAttributes<SaleReturnItem>
> {
  declare id: CreationOptional<number>;
  declare saleReturnId: number;
  declare saleItemId: number;
  declare productId: number;
  declare quantity: number;
  declare unitPrice: number;
  declare refundAmount: number;
  declare condition: "RESALEABLE" | "DAMAGED" | "EXPIRED";
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

export function initSaleReturnItem(sequelize: Sequelize) {
  SaleReturnItem.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },

      saleReturnId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },

      saleItemId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },

      productId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },

      quantity: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },

      unitPrice: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },

      refundAmount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },

      condition: {
        type: DataTypes.ENUM("RESALEABLE", "DAMAGED", "EXPIRED"),
        allowNull: false,
      },

      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      tableName: "sale_return_items",
      timestamps: true,
    }
  );
}
