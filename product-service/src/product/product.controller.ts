import { Controller, Get, Patch, Param, Query, Body } from '@nestjs/common';
import { ProductService } from './product.service';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  findAll(@Query('category') category?: string) {
    if (category) return this.productService.findByCategory(category);
    return this.productService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.productService.findById(id);
  }

  @Patch(':sku/deduct-stock')
  deductStock(@Param('sku') sku: string, @Body('quantity') quantity: number) {
    return this.productService.deductStock(sku, quantity);
  }
}
