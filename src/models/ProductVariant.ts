// models/ProductVariant.ts
import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from "sequelize";
import Product from "./Product.js";

export default class ProductVariant extends Model<
  InferAttributes<ProductVariant>,
  InferCreationAttributes<ProductVariant>
> {
  declare id: CreationOptional<number>;
  declare productId: ForeignKey<Product['id']>;
  declare sku?: string | null;
  declare price?: number | null;
  declare inventory?: number | null;
  declare options: { name: string; value: string }[]; // e.g. [{name: 'Size', value: 'M'}, {name: 'Color', value: 'Red'}]

  

}
export function initProductVariantModel(sequelize: Sequelize) {
  ProductVariant.init(
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      productId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      sku: { type: DataTypes.STRING(128), allowNull: true },
      price: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
      inventory: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
      options: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    },
    {
      sequelize,
      tableName: "product_variants",
      timestamps: true,
    }
  );
}
