import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
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

// Fixed advisory lock key — all pods use the same integer.
// Only one pod can hold this transaction-level lock at a time.
const CRON_LOCK_KEY = 8823001;

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectRepository(Purchase)
    private purchaseRepository: Repository<Purchase>,
    private dataSource: DataSource,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { name: 'daily-sales-report' })
  async runDailyReport() {
    // ── Leader election via PostgreSQL advisory lock ─────────────────────────
    // pg_try_advisory_xact_lock:
    //   - Non-blocking: returns true (leader) or false (follower) immediately
    //   - Transaction-level: lock auto-releases when the transaction ends
    //   - Safe with connection pools: QueryRunner pins one connection
    // Only the pod that acquires the lock runs the report. All others skip.
    // ────────────────────────────────────────────────────────────────────────
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const [{ acquired }] = await queryRunner.query(
        'SELECT pg_try_advisory_xact_lock($1) AS acquired',
        [CRON_LOCK_KEY],
      );

      if (!acquired) {
        this.logger.log(`[Cron] Not leader — skipping daily report on this pod`);
        await queryRunner.rollbackTransaction();
        return;
      }

      this.logger.log(`[Cron] Leader elected — running daily report`);
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

      await queryRunner.commitTransaction(); // advisory lock auto-released here
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`[Cron] Daily report failed: ${err.message}`);
    } finally {
      await queryRunner.release();
    }
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
