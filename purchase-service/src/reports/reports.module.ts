import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Purchase } from '../purchase/purchase.entity';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [TypeOrmModule.forFeature([Purchase])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
