// models/WarehouseStock.ts
import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  Sequelize,
  CreationOptional,
  ForeignKey,
} from "sequelize";
import { Warehouse } from "./Warehouse.js";
// import { Product } from "./Product.js";

export class WarehouseStock extends Model<
  InferAttributes<WarehouseStock>,
  InferCreationAttributes<WarehouseStock>
> {
  declare id: CreationOptional<number>;
  declare warehouseId: ForeignKey<Warehouse["id"]>;
//   declare productId: ForeignKey<Product["id"]>;
  declare quantity: number;
  declare reserved?: number; // for pending transfers / reservations
  declare tenantId: string;
}

export const initWarehouseStockModel = (sequelize: Sequelize) => {
  WarehouseStock.init(
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      warehouseId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    //   productId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      quantity: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
      reserved: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
      tenantId: { type: DataTypes.STRING, allowNull: false },
    },
    { tableName: "warehouse_stocks", sequelize, timestamps: true }
  );
};
