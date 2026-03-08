import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Purchase } from '../purchase/purchase.entity';
import { Migration1772848724527 } from '../migrations/1772848724527-migration';
import { ReportsModule } from '../reports/reports.module';

// Minimal NestJS application context used exclusively by the K8s CronJob pod.
// It only wires up what runDailyReport() needs: DB connection + ReportsModule.
// migrationsRun is false — the main service Deployment already runs migrations
// before this CronJob pod is ever scheduled.
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [Purchase],
        migrations: [Migration1772848724527],
        migrationsRun: false,
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    ReportsModule,
  ],
})
export class CronAppModule {}
