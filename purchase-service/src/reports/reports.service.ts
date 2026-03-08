import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Purchase } from '../purchase/purchase.entity';

export interface TopProduct {
  sku: string;
  quantitySold: number;
  revenue: number;
}

export interface DailySalesReport {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  confirmedOrders: number;
  pendingOrders: number;
  uniqueCustomers: number;
  topProducts: TopProduct[];
}

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectRepository(Purchase)
    private purchaseRepository: Repository<Purchase>,
  ) {}

  // Called directly by the K8s CronJob entrypoint (src/cron/daily-report.ts).
  // In development, trigger via: npm run cron:run
  async runDailyReport(): Promise<void> {
    this.logger.log('[Cron] Running daily report');
    const report = await this.buildReport(new Date());

    this.logger.log('========== DAILY SALES REPORT ==========');
    this.logger.log(`Date            : ${report.date}`);
    this.logger.log(`Total Orders    : ${report.totalOrders}`);
    this.logger.log(`Total Revenue   : $${report.totalRevenue.toFixed(2)}`);
    this.logger.log(`Confirmed       : ${report.confirmedOrders}`);
    this.logger.log(`Pending         : ${report.pendingOrders}`);
    this.logger.log(`Unique Customers: ${report.uniqueCustomers}`);
    this.logger.log('Top Products:');
    report.topProducts.forEach((p, i) => {
      this.logger.log(
        `  ${i + 1}. ${p.sku} — qty: ${p.quantitySold}, revenue: $${p.revenue.toFixed(2)}`,
      );
    });
    this.logger.log('========================================');
  }

  async buildReport(date: Date): Promise<DailySalesReport> {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const purchases = await this.purchaseRepository
      .createQueryBuilder('p')
      .where('p.created_at >= :start AND p.created_at <= :end', { start, end })
      .getMany();

    const totalRevenue = purchases.reduce((sum, p) => sum + Number(p.total), 0);
    const confirmedOrders = purchases.filter((p) => p.status === 'confirmed').length;
    const pendingOrders = purchases.filter((p) => p.status === 'pending').length;
    const uniqueCustomers = new Set(purchases.map((p) => p.user_id)).size;

    const productMap: Record<string, TopProduct> = {};
    for (const purchase of purchases) {
      for (const item of purchase.items) {
        if (!productMap[item.productId]) {
          productMap[item.productId] = { sku: item.productId, quantitySold: 0, revenue: 0 };
        }
        productMap[item.productId].quantitySold += item.quantity;
        productMap[item.productId].revenue += item.quantity * Number(item.price);
      }
    }

    const topProducts = Object.values(productMap)
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 5);

    return {
      date: start.toISOString().split('T')[0],
      totalOrders: purchases.length,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      confirmedOrders,
      pendingOrders,
      uniqueCustomers,
      topProducts,
    };
  }
}
