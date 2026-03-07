import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../product/product.entity';

const SEED_PRODUCTS = [
  // Electronics
  {
    sku: 'ELEC-001',
    name: 'Laptop Pro 15',
    description: '15" laptop with Intel Core i7, 16GB RAM, 512GB SSD',
    price: 1299.99,
    category: 'Electronics',
    stock: 50,
  },
  {
    sku: 'ELEC-002',
    name: 'Smartphone X12',
    description: '6.7" AMOLED display, 256GB storage, 5G enabled',
    price: 899.99,
    category: 'Electronics',
    stock: 120,
  },
  {
    sku: 'ELEC-003',
    name: 'Tablet Air 11"',
    description: 'Lightweight tablet with M2 chip and 10-hour battery',
    price: 599.99,
    category: 'Electronics',
    stock: 75,
  },
  {
    sku: 'ELEC-004',
    name: 'Noise-Cancelling Headphones',
    description: 'Over-ear headphones with 30-hour ANC battery life',
    price: 299.99,
    category: 'Electronics',
    stock: 200,
  },
  {
    sku: 'ELEC-005',
    name: 'Smartwatch Series 5',
    description: 'GPS, heart rate monitor, sleep tracking, waterproof',
    price: 399.99,
    category: 'Electronics',
    stock: 90,
  },
  // Accessories
  {
    sku: 'ACC-001',
    name: 'Mechanical Keyboard',
    description: 'TKL layout, Cherry MX Red switches, RGB backlight',
    price: 149.99,
    category: 'Accessories',
    stock: 150,
  },
  {
    sku: 'ACC-002',
    name: 'Wireless Mouse',
    description: 'Ergonomic design, 3-month battery life, 4000 DPI',
    price: 59.99,
    category: 'Accessories',
    stock: 300,
  },
  {
    sku: 'ACC-003',
    name: '4K Monitor 27"',
    description: 'IPS panel, 144Hz refresh rate, HDR400, USB-C',
    price: 499.99,
    category: 'Accessories',
    stock: 40,
  },
  {
    sku: 'ACC-004',
    name: 'USB-C Hub 7-in-1',
    description: 'HDMI 4K, 3x USB-A, SD card, 100W PD charging',
    price: 79.99,
    category: 'Accessories',
    stock: 250,
  },
  {
    sku: 'ACC-005',
    name: 'Webcam 4K',
    description: 'Auto-focus, built-in stereo mic, 90° wide angle',
    price: 129.99,
    category: 'Accessories',
    stock: 110,
  },
  // Audio
  {
    sku: 'AUD-001',
    name: 'Bluetooth Speaker',
    description: '360° sound, IPX7 waterproof, 20-hour playtime',
    price: 89.99,
    category: 'Audio',
    stock: 180,
  },
  {
    sku: 'AUD-002',
    name: 'Wireless Earbuds',
    description: 'Active noise cancellation, 28-hour case battery',
    price: 149.99,
    category: 'Audio',
    stock: 220,
  },
  {
    sku: 'AUD-003',
    name: 'Studio Microphone',
    description: 'Cardioid condenser mic, USB, for streaming and recording',
    price: 199.99,
    category: 'Audio',
    stock: 60,
  },
  // Storage
  {
    sku: 'STR-001',
    name: 'External SSD 1TB',
    description: 'NVMe speeds up to 2000MB/s, USB-C, pocket-sized',
    price: 119.99,
    category: 'Storage',
    stock: 140,
  },
  {
    sku: 'STR-002',
    name: 'USB Flash Drive 256GB',
    description: 'USB 3.2 Gen 1, compact swivel design, 400MB/s read',
    price: 29.99,
    category: 'Storage',
    stock: 500,
  },
];

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async onApplicationBootstrap() {
    await this.seed();
  }

  private async seed() {
    // INSERT ... ON CONFLICT (sku) DO NOTHING — idempotent, never duplicates
    await this.productRepository
      .createQueryBuilder()
      .insert()
      .into(Product)
      .values(SEED_PRODUCTS)
      .orIgnore()
      .execute();

    const count = await this.productRepository.count();
    this.logger.log(`Products table ready — ${count} product(s) in DB`);
  }
}
