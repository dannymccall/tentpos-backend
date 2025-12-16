import {
  DataType,
  Model,
  InferCreationAttributes,
  InferAttributes,
  Sequelize,
  CreationOptional,
  ForeignKey,
  DataTypes,
} from "sequelize";

export class AppProfileSettings extends Model<
  InferAttributes<AppProfileSettings>,
  InferCreationAttributes<AppProfileSettings>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare email: string;
  declare website?: string;
  declare description?: string;
  declare logo?: string;
  declare tenantId: string;
  declare primaryColor?:string;
  declare secondaryColor?: string;
}

export function initAppProfileSettings(sequelize: Sequelize) {
  AppProfileSettings.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      logo: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tenantId: {
        type: DataTypes.STRING,

        allowNull: false,
      },
      primaryColor:{
        type: DataTypes.STRING,
      },
      secondaryColor:{
        type: DataTypes.STRING,
      }
    },
    {
      timestamps: true,
      underscored: true,
      tableName: "app_profiles_settings",
      sequelize,
    }
  );
}
