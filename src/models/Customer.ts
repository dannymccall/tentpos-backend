import {
  Model,
  DataTypes,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  Sequelize,
} from "sequelize";

export  class Customer extends Model<
  InferAttributes<Customer>,
  InferCreationAttributes<Customer>
> {
  declare id: CreationOptional<number>;
  declare firstName: string;
  declare lastName: string;
  declare email?: string | null;
  declare phone?: string | null;
  declare address?: string | null;
  declare tenantId: string;
  declare branchId?: number | null;
  declare creditLimit?: number | null;
}

export function initCustomerModel(sequelize: Sequelize){

    Customer.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        firstName: { type: DataTypes.STRING, allowNull: false },
        lastName: { type: DataTypes.STRING, allowNull: false },
        email: { type: DataTypes.STRING, allowNull: true, unique: true },
        phone: { type: DataTypes.STRING, allowNull: true },
        address: { type: DataTypes.TEXT, allowNull: true },
        tenantId: { type: DataTypes.STRING, allowNull: false },
        branchId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
        creditLimit: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
      },
      {
        sequelize,
        tableName: "customers",
      }
    );
}

