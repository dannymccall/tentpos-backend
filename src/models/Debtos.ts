import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Sequelize,
  ForeignKey,
  CreationOptional,
} from "sequelize";
import { Branch } from "./Branch.js";

export default class Debtor extends Model<
  InferAttributes<Debtor>,
  InferCreationAttributes<Debtor>
> {
  declare id: CreationOptional<number>;
  declare customerId: number;
  declare totalOwed: number;
  declare oldestDebtDate: Date | null;
  declare lastSaleDate: Date | null;
  declare status: "ACTIVE" | "CLEARED" | "BLOCKED";
  declare tenantId: string;
  declare branchId: ForeignKey<Branch["id"]>;
}
export function initDebotorsModel(sequelize: Sequelize) {
  Debtor.init(
    {
          id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      customerId: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
      },
      totalOwed: {
        type: DataTypes.DECIMAL(12, 2),
      },
      oldestDebtDate: {
        type: DataTypes.DATE,
      },
      lastSaleDate: {
        type: DataTypes.DATE,
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "ACTIVE",
      },
      tenantId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      branchId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    },
    {
      sequelize,
      tableName: "debtors",
      timestamps: false,
    }
  );
}
