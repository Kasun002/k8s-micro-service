import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { CartItem } from './cart/cart.entity';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'cart_db',
  entities: [CartItem],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
