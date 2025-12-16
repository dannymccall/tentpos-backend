// models/LocationStock.ts
import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  Sequelize,
  CreationOptional,
  ForeignKey,
} from "sequelize";
import { Branch } from "./Branch.js";
// import { Product } from "./Product.js";

export class LocationStock extends Model<
  InferAttributes<LocationStock>,
  InferCreationAttributes<LocationStock>
> {
  declare id: CreationOptional<number>;
  declare locationType: "branch" | "warehouse";
  declare locationId: number; // branchId or warehouseId depending on locationType
//   declare productId: ForeignKey<Product["id"]>;
  declare quantity: number;
  declare tenantId: string;
}

export const initLocationStockModel = (sequelize: Sequelize) => {
  LocationStock.init(
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      locationType: { type: DataTypes.ENUM("branch", "warehouse"), allowNull: false, defaultValue: "branch" },
      locationId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    //   productId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      quantity: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
      tenantId: { type: DataTypes.STRING, allowNull: false },
    },
    { tableName: "location_stocks", sequelize, timestamps: true }
  );
};
