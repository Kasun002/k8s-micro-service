import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Purchase } from './purchase/purchase.entity';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'purchase_db',
  entities: [Purchase],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
