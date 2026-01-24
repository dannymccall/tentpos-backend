import { Model, DataTypes, InferAttributes, InferCreationAttributes, Sequelize } from "sequelize";


export class Supplier extends Model<
  InferAttributes<Supplier>,
  InferCreationAttributes<Supplier>
> {
  declare id: number;
  declare name: string;
  declare email?: string | null;
  declare phone?: string | null;
  declare address?: string | null;
  declare contactPerson?: string | null;
  declare notes?: string | null;
  declare openingBalance?: number | null;
  declare tenantId: string
  declare createdAt?: Date;
  declare updatedAt?: Date;
}

export function initSupplierModel(sequelize: Sequelize) {
  Supplier.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      name: { type: DataTypes.STRING(200), allowNull: false },
      email: { type: DataTypes.STRING(200), allowNull: true },
      phone: { type: DataTypes.STRING(64), allowNull: true },
      address: { type: DataTypes.TEXT, allowNull: true },
      contactPerson: { type: DataTypes.STRING(200), allowNull: true },
      notes: { type: DataTypes.TEXT, allowNull: true },
      openingBalance: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        defaultValue: 0.00,
      },
      tenantId: {
        type: DataTypes.STRING(100),

        allowNull: false
      }
    },
    { sequelize: sequelize, tableName: "suppliers", timestamps: true }
  );
}

export default Supplier;
