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
    logging: console.log,
    dialectOptions: {
      charset: 'utf8mb4',
      dateStrings: true,
      typeCast: true
    },
    pool:{
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
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

// Test connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully with Sequelize');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    process.exit(1);
  }
};

testConnection();

export default sequelize;