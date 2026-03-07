import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService, DailySalesReport } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('daily')
  getDailyReport(@Query('date') date?: string): Promise<DailySalesReport> {
    const reportDate = date ? new Date(date) : new Date();
    return this.reportsService.buildReport(reportDate);
  }
}
