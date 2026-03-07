import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './cart.entity';
import { SqsService } from '../sqs/sqs.service';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private cartRepository: Repository<CartItem>,
    private sqsService: SqsService,
  ) {}

  async addItem(dto: {
    userId: string;
    productId: string;
    quantity: number;
    price: number;
  }): Promise<CartItem> {
    const item = this.cartRepository.create({
      user_id: dto.userId,
      product_id: dto.productId,
      quantity: dto.quantity,
      price: dto.price,
    });
    return this.cartRepository.save(item);
  }

  async getCartByUser(userId: string): Promise<CartItem[]> {
    return this.cartRepository.find({ where: { user_id: userId } });
  }

  async removeItem(id: string): Promise<void> {
    const item = await this.cartRepository.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Cart item ${id} not found`);
    await this.cartRepository.remove(item);
  }

  async checkout(userId: string): Promise<{ message: string }> {
    const items = await this.getCartByUser(userId);
    if (!items.length) throw new NotFoundException(`No cart items for user ${userId}`);

    const total = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

    const payload = {
      userId,
      items: items.map((i) => ({
        productId: i.product_id,
        quantity: i.quantity,
        price: Number(i.price),
      })),
      total: Number(total.toFixed(2)),
      paymentMethod: 'cod',
    };

    await this.sqsService.sendMessage(payload);
    await this.cartRepository.delete({ user_id: userId });

    return { message: 'Checkout initiated' };
  }
}
