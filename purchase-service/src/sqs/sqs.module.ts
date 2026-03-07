import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SqsConsumer } from './sqs.consumer';
import { PurchaseModule } from '../purchase/purchase.module';

@Module({
  imports: [ConfigModule, PurchaseModule],
  providers: [SqsConsumer],
})
export class SqsModule {}
