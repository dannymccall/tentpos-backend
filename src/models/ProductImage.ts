// models/ProductImage.ts
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

export default class ProductImage extends Model<
  InferAttributes<ProductImage>,
  InferCreationAttributes<ProductImage>
> {
  declare id: CreationOptional<number>;
  declare productId: ForeignKey<Product['id']>;
  declare url: string;
  declare alt?: string | null;
  declare order?: number | null;

}
export function  initProductImageModel(sequelize: Sequelize) {
  ProductImage.init(
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      productId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      url: { type: DataTypes.STRING(1024), allowNull: false },
      alt: { type: DataTypes.STRING(255), allowNull: true },
      order: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
      sequelize,
      tableName: "product_images",
      timestamps: true,
    }
  );
}
