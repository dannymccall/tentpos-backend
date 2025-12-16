// database.ts
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import { ENV } from "./env.js";
dotenv.config();

const sequelize = new Sequelize(ENV.DB_NAME, ENV.DB_USER, ENV.DB_PASSWORD, {
  host: ENV.DB_HOST,
  port: ENV.DB_PORT,
  dialect: "mysql",
  logging: (msg) => console.log(`[Sequelize] ${msg}`),
  define: {underscored: false}
});

export default sequelize;
