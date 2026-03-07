import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModule } from './product/product.module';
import { SeedModule } from './seed/seed.module';
import { Product } from './product/product.entity';
import { Migration1772853367604 } from './migrations/1772853367604-migration';

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
        entities: [Product],
        migrations: [Migration1772853367604],
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
    ProductModule,
    SeedModule,
  ],
})
export class AppModule {}
