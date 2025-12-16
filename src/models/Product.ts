// models/Product.ts
import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute,
  HasManyGetAssociationsMixin,
  HasManyAddAssociationMixin,
  ForeignKey,
} from "sequelize";
import ProductImage from "./ProductImage.js";
import ProductVariant from "./ProductVariant.js";
import { Category } from "./Category.js";
import { ProductBranch } from "./ProductBranch.js";

export default class Product extends Model<
  InferAttributes<Product, { omit: "variants" | "images" }>,
  InferCreationAttributes<Product, { omit: "variants" | "images" }>
> {
  declare id: CreationOptional<number>;
  declare title: string;
  declare description?: string | null;
  declare categoryId?: ForeignKey<Category["id"]>;
  declare brand?: number;
  declare sku?: string | null;
  declare barcode?: string | null;
  declare tenantId: string;

  declare price: number;
  declare compareAtPrice?: number | null;
  declare cost?: number | null;

  declare trackInventory?: boolean;
  declare status?: "draft" | "active";
  declare tags?: string[] | null;

  declare weight?: string | null;
  declare dimensions?: {
    width?: string;
    height?: string;
    depth?: string;
  } | null;

  // associations (not persisted)
  declare variants?: NonAttribute<ProductVariant[]>;
  declare images?: NonAttribute<ProductImage[]>;
  declare product?: NonAttribute<ProductBranch>;
  declare branches?: NonAttribute<ProductBranch[]>;
  declare branchInventory?: NonAttribute<ProductBranch>;
  declare threshold: number
}

export function initProductModel(sequelize: Sequelize) {
  Product.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      title: { type: DataTypes.STRING(255), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      categoryId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
      brand: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
      price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      compareAtPrice: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
      cost: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
      sku: { type: DataTypes.STRING(128), allowNull: true },
      barcode: { type: DataTypes.STRING(128), allowNull: true },
      trackInventory: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      status: {
        type: DataTypes.ENUM("draft", "active"),
        allowNull: false,
        defaultValue: "draft",
      },
      tags: {
        type: DataTypes.JSON,
        allowNull: true,
        get() {
          const raw = this.getDataValue("tags");
          return Array.isArray(raw) ? raw : [];
        },
      },
      weight: { type: DataTypes.STRING(64), allowNull: true },
      dimensions: { type: DataTypes.JSON, allowNull: true },
      tenantId: {type:DataTypes.STRING, allowNull:false},
      threshold: {type:DataTypes.INTEGER, allowNull:false, defaultValue:0}
    },
    {
      sequelize,
      tableName: "products",
      timestamps: true,
    }
  );
}
