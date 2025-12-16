import {
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";
import { Branch } from "./Branch.js";
import { User } from "./User.js";

export default class Payment extends Model<
  InferAttributes<Payment>,
  InferCreationAttributes<Payment>
> {
  declare id: CreationOptional<number>;
  declare saleId: number;
  declare amount: number;
  declare method: "CASH" | "MOMO" | "BANK" | "CRYPTO";
  declare tenantId: string;
  declare branchId: ForeignKey<Branch["id"]>;
  declare userId: ForeignKey<User["id"]>;
  declare description: string;
}
export function initPaymentModel(sequelize: Sequelize) {
  Payment.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      saleId: DataTypes.INTEGER.UNSIGNED,
      amount: DataTypes.DECIMAL(12, 2),
      method: DataTypes.STRING,
      tenantId: DataTypes.STRING(100),
      branchId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      description: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: "Payment received",
      },
    },
    { sequelize, tableName: "payments", timestamps: true }
  );
}
