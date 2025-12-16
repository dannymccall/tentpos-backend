// models/Expense.ts
import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  Sequelize,
  ForeignKey,
  CreationOptional,
} from "sequelize";
import { Branch } from "./Branch.js";

export class Expense extends Model<
  InferAttributes<Expense>,
  InferCreationAttributes<Expense>
> {
  declare id: CreationOptional<number>;
  declare title: string;
  declare amount: number;
  declare category: string;
  declare description?: string;

  declare date: string; // DATEONLY
  // declare recurring: boolean;
  // declare recurrenceFrequency?: "weekly" | "monthly" | "yearly";
  // declare recurrenceEndDate?: string | null;

  declare tenantId: string;
  declare branchId: ForeignKey<Branch["id"]>;
  declare createdAt?: Date;
  declare updatedAt?: Date;
}

export function initExpense(sequelize: Sequelize) {
  Expense.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },

      title: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },

      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },

      category: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      description: {
        type: DataTypes.TEXT,
      },

      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },

      // recurring: {
      //   type: DataTypes.BOOLEAN,
      //   defaultValue: false,
      // },

      // recurrenceFrequency: {
      //   type: DataTypes.ENUM("weekly", "monthly", "yearly"),
      //   allowNull: true,
      // },

      // recurrenceEndDate: {
      //   type: DataTypes.DATEONLY,
      //   allowNull: true,
      // },

      tenantId: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      branchId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Expense",
      tableName: "expenses",
      timestamps: true,
    }
  );
}
