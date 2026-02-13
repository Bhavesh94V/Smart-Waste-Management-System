import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'smart_waste_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: process.env.DB_DIALECT || 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true
    }
  }
);

export const initializePostgres = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to PostgreSQL/MySQL database');
    
    // Sync models (create tables if they don't exist)
    // Use { alter: true } in development, { force: false } in production
    await sequelize.sync({ 
      alter: process.env.NODE_ENV === 'development',
      force: false 
    });
    
    return sequelize;
  } catch (error) {
    console.error('Unable to connect to database:', error);
    throw error;
  }
};

export default sequelize;
