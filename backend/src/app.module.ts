import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { envValidationSchema } from './config/env.validations';

@Module({
  imports: [
    // 1. Módulo de Configuración Global (Fail Fast)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env', 
      validationSchema: envValidationSchema,
    }),
    
    // 2. Conexión a PostgreSQL segura
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        autoLoadEntities: true,
        // synchronize en true solo para desarrollo temprano.
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
      }),
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}