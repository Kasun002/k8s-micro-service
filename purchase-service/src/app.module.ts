import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseModule } from './purchase/purchase.module';
import { SqsModule } from './sqs/sqs.module';
import { AdminModule } from './admin/admin.module';
import { Purchase } from './purchase/purchase.entity';
import { Migration1772848724527 } from './migrations/1772848724527-migration';

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
        migrationsRun: true,
        synchronize: false,
        extra: {
          max: 10,
          min: 2,
          idleTimeoutMillis: 30000,
        },
      }),
      inject: [ConfigService],
    }),
    PurchaseModule,
    SqsModule,
    AdminModule,
  ],
})
export class AppModule {}
