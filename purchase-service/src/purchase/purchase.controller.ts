import { Controller, Get, Param } from '@nestjs/common';
import { PurchaseService } from './purchase.service';

@Controller('purchases')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Get()
  findAll() {
    return this.purchaseService.findAll();
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.purchaseService.findByUser(userId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.purchaseService.findById(id);
  }
}
