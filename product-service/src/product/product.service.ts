import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  findAll(): Promise<Product[]> {
    return this.productRepository.find({
      where: { is_active: true },
      order: { category: 'ASC', name: 'ASC' },
    });
  }

  findByCategory(category: string): Promise<Product[]> {
    return this.productRepository.find({
      where: { category, is_active: true },
      order: { name: 'ASC' },
    });
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id, is_active: true } });
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }

  async deductStock(sku: string, quantity: number): Promise<void> {
    // Single atomic UPDATE: check + decrement in one SQL statement.
    // Prevents race conditions — two concurrent orders cannot both pass
    // the stock check and drive stock negative.
    const result = await this.productRepository
      .createQueryBuilder()
      .update(Product)
      .set({ stock: () => `stock - ${quantity}` })
      .where('sku = :sku AND stock >= :quantity', { sku, quantity })
      .execute();

    if (result.affected === 0) {
      throw new NotFoundException(
        `Insufficient stock or product not found for SKU: ${sku}`,
      );
    }
  }
}
