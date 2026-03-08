// ── K8s CronJob entrypoint ────────────────────────────────────────────────────
// This file is the command run by the K8s CronJob:
//   Production : node dist/cron/daily-report.js
//   Development: npm run cron:run
//
// It bootstraps a minimal NestJS application context, runs the daily report
// once, then exits. K8s handles scheduling and concurrencyPolicy: Forbid
// ensures only one pod ever runs at a time — no leader election needed.
// ─────────────────────────────────────────────────────────────────────────────

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { CronAppModule } from './cron-app.module';
import { ReportsService } from '../reports/reports.service';

async function bootstrap() {
  const logger = new Logger('DailyReportCron');

  const app = await NestFactory.createApplicationContext(CronAppModule, {
    logger: ['log', 'warn', 'error'],
  });

  let exitCode = 0;

  try {
    logger.log('Daily report job started');
    const reportsService = app.get(ReportsService);
    await reportsService.runDailyReport();
    logger.log('Daily report job completed successfully');
  } catch (err) {
    logger.error(`Daily report job failed: ${(err as Error).message}`);
    exitCode = 1;
  } finally {
    // Always close cleanly so DB connections are released before the
    // process exits. process.exit() inside try/catch would skip this.
    await app.close();
  }

  process.exit(exitCode);
}

void bootstrap();
