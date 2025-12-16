// models/Branch.ts
import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  Sequelize,
  CreationOptional,
  ForeignKey,
} from "sequelize";

export class Branch extends Model<
  InferAttributes<Branch>,
  InferCreationAttributes<Branch>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare code?: string;
  declare address?: string;
  declare city?: string;
  declare region?: string;
  declare phone?: string;
  declare email?: string;
  declare tenantId:string;
  declare createdAt?: Date;
  declare updatedAt?: Date;
}

export function initBranch(sequelize: Sequelize) {
  Branch.init(
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING(100), allowNull: false },
      code: { type: DataTypes.STRING(20), unique: true },
      address: { type: DataTypes.STRING(255) },
      city: { type: DataTypes.STRING(100) },
      region: { type: DataTypes.STRING(100) },
      phone: { type: DataTypes.STRING(20) },
      email: { type: DataTypes.STRING(150) },
      tenantId: {
        type:DataTypes.STRING,
        allowNull:false
      }
    },
    {
      sequelize,
      modelName: "Branch",
      tableName: "branches",
      timestamps: true,
    }
  );
}
