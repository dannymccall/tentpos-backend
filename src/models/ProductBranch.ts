import {
  InferAttributes,
  Model,
  CreationOptional,
  InferCreationAttributes,
  ForeignKey,
  DataTypes,
} from "sequelize";
import Product from "./Product.js";
import { Branch } from "./Branch.js";

export  class ProductBranch extends Model<
  InferAttributes<ProductBranch>,
  InferCreationAttributes<ProductBranch>
> {
  declare id: CreationOptional<number>;
  declare productId: ForeignKey<Product["id"]>;
  declare branchId: ForeignKey<Branch["id"]>;
  declare qtySold?: number;
  declare price: number | null; // optional override
  declare inventory: number;
  declare reorderLevel?: number | null;
  declare tenantId: string;
  declare isActive?: boolean; // visible in this branch
}

export function initProductBranchModel(sequelize: any) {
  ProductBranch.init(
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
      price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
      },
      inventory: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      reorderLevel: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      qtySold: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      tenantId: {
        type: DataTypes.STRING,
        allowNull: false, 
      }
    },
    {
      sequelize,
      tableName: "product_branches",
      timestamps: true,
    }
  );
}
