import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  Sequelize,
  NonAttribute,
  ForeignKey,
} from "sequelize";
import {SaleItem} from "./SaleItem.js";
import { Branch } from "./Branch.js";
import { User } from "./User.js";
import { Customer } from "./Customer.js";

export  class Sale extends Model<
  InferAttributes<Sale>,
  InferCreationAttributes<Sale>
> {
  declare id: CreationOptional<number>;
  declare saleNumber: string;
  declare customerId?: number | null;
  declare subtotal: number;
  declare discount: number;
  declare tax: number;
  declare total: number;
  declare paymentMethod?: string | null;
  declare status: string; // PENDING | PAID | CANCELLED
  declare paymentStatus: string; // UNPAID | PARTIAL | PAID
  declare tenantId: string;
  declare branchId?: ForeignKey<Branch['id']>;
  declare amountPaid: number
  declare saleItems?: NonAttribute<SaleItem[]>
  declare balance: number
  declare date: string;
  declare userId: ForeignKey<User['id']>;
  declare customer?: NonAttribute<Customer>;
  declare branchInvoice?: NonAttribute<Branch>;
  // SaleItem
declare discountType?: "FIXED" | "PERCENT" | null;

declare discountValue?: number | null;
declare createdAt?: string;
declare branchSale?: NonAttribute<Branch>;
declare userSale?: NonAttribute<User>

}

export function initSaleModel(sequelize: Sequelize) {
  Sale.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      saleNumber: { type: DataTypes.STRING, unique: true },
      customerId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
      subtotal: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
      discount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
      amountPaid: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
      balance: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
      tax: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
      total: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
      paymentMethod: { type: DataTypes.STRING, allowNull: true },
      status: { type: DataTypes.STRING, defaultValue: "PENDING" },
      paymentStatus: { type: DataTypes.STRING, defaultValue: "UNPAID" },
      tenantId: { type: DataTypes.STRING },
      branchId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
      date: {type: DataTypes.DATE},
      userId: { type: DataTypes.INTEGER.UNSIGNED },
      discountType: {type: DataTypes.ENUM("FIXED", "PERCENT"), allowNull:true},
      discountValue: {type:DataTypes.INTEGER, allowNull:true}
    },
    { sequelize, tableName: "sales", timestamps: true }
  );
}
