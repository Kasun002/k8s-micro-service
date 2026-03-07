import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItem } from './cart.entity';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { SqsModule } from '../sqs/sqs.module';

@Module({
  imports: [TypeOrmModule.forFeature([CartItem]), SqsModule],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
