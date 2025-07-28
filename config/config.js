import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

const config = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      charset: 'utf8mb4'
    }
  }
};

// Khởi tạo sequelize
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

export const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  dbConfig
);

export default config;