// models/Session.ts
import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  Sequelize,
  ForeignKey,
  CreationOptional,
} from "sequelize";

export class Session extends Model<
  InferAttributes<Session>,
  InferCreationAttributes<Session>
> {
  declare id: CreationOptional<number>;
  declare email: string;
  declare refreshTokenHash: string;
  declare deviceInfo?: string;
  declare ip?: string;
  declare lastUsedAt: Date;
  declare createdAt?: Date;
  declare sessionId: string
}

export function initSession(sequelize: Sequelize) {
 Session.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    email: { type: DataTypes.STRING, allowNull: true, },
    refreshTokenHash: { type: DataTypes.STRING, allowNull: false },
    deviceInfo: { type: DataTypes.STRING },
    ip: { type: DataTypes.STRING },
    lastUsedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    sessionId: { type: DataTypes.STRING, allowNull: false }
  },
  { sequelize, modelName: "Session", tableName: "sessions", timestamps: true }
);

}
