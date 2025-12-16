import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  Sequelize,
} from "sequelize";
export  class SaleItem extends Model<
  InferAttributes<SaleItem>,
  InferCreationAttributes<SaleItem>
> {
  declare id: CreationOptional<number>;
  declare saleId: number;
  declare productId: number;
  declare quantity: number;
  declare price: number;
  declare total: number;
  declare cost: number;
}

export function initSaleItemModel(sequelize: Sequelize) {
  SaleItem.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      saleId: { type: DataTypes.INTEGER.UNSIGNED },
      productId: { type: DataTypes.INTEGER.UNSIGNED },
      quantity: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 1 },
      price: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
      total: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
      cost: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    },
    { sequelize, tableName: "sale_items" }
  );
}
