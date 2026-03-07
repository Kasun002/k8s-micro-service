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
}
