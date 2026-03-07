import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Purchase } from './purchase.entity';

@Injectable()
export class PurchaseService {
  constructor(
    @InjectRepository(Purchase)
    private purchaseRepository: Repository<Purchase>,
  ) {}

  async createFromMessage(payload: {
    userId: string;
    items: Array<{ productId: string; quantity: number; price: number }>;
    total: number;
  }): Promise<Purchase> {
    const purchase = this.purchaseRepository.create({
      user_id: payload.userId,
      items: payload.items,
      total: payload.total,
      status: 'pending',
    });
    return this.purchaseRepository.save(purchase);
  }

  async findAll(): Promise<Purchase[]> {
    return this.purchaseRepository.find({ order: { created_at: 'DESC' } });
  }

  async findById(id: string): Promise<Purchase> {
    const purchase = await this.purchaseRepository.findOne({ where: { id } });
    if (!purchase) throw new NotFoundException(`Purchase ${id} not found`);
    return purchase;
  }

  async findByUser(userId: string): Promise<Purchase[]> {
    return this.purchaseRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }
}
