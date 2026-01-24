import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  Sequelize,
  ForeignKey,
} from "sequelize";
import { Branch } from "./Branch.js";

export class Invoice extends Model<
  InferAttributes<Invoice>,
  InferCreationAttributes<Invoice>
> {
  declare id: CreationOptional<number>;
  declare invoiceNumber: string;
  declare saleId: number;
  declare customerId?: number | null;
  declare amountDue: number;
  declare status: string; // PENDING | PAID | OVERDUE
  declare dueDate?: string | null;
  declare tenantId: string;
  declare branchId?: ForeignKey<Branch["id"]>;
}
export function initInvoiceModel(sequelize: Sequelize) {
  Invoice.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      invoiceNumber: { type: DataTypes.STRING, unique: true },
      saleId: { type: DataTypes.INTEGER.UNSIGNED, unique:true },
      customerId: { type: DataTypes.INTEGER, allowNull: true },
      amountDue: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
      status: { type: DataTypes.STRING, defaultValue: "PENDING" },
      dueDate: { type: DataTypes.DATEONLY, allowNull: true },
      tenantId: { type: DataTypes.STRING },
      branchId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    },
    { sequelize, tableName: "invoices", timestamps: true, }
  );
}
