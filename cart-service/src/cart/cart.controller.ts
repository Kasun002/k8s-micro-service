import { Controller, Post, Get, Delete, Param, Body } from '@nestjs/common';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  addItem(
    @Body()
    body: {
      userId: string;
      productId: string;
      quantity: number;
      price: number;
    },
  ) {
    return this.cartService.addItem(body);
  }

  @Get(':userId')
  getCart(@Param('userId') userId: string) {
    return this.cartService.getCartByUser(userId);
  }

  @Delete(':id')
  removeItem(@Param('id') id: string) {
    return this.cartService.removeItem(id);
  }

  @Post('checkout/:userId')
  checkout(@Param('userId') userId: string) {
    return this.cartService.checkout(userId);
  }
}
