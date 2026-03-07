import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartModule } from './cart/cart.module';
import { CartItem } from './cart/cart.entity';
import { Migration1772848720611 } from './migrations/1772848720611-migration';

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
        entities: [CartItem],
        migrations: [Migration1772848720611],
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
    CartModule,
  ],
})
export class AppModule {}
