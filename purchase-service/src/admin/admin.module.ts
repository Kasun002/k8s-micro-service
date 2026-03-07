import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminController } from './admin.controller';
import { PurchaseModule } from '../purchase/purchase.module';

@Module({
  imports: [ConfigModule, PurchaseModule],
  controllers: [AdminController],
})
export class AdminModule {}
