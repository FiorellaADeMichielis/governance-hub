import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices'; // <-- NUEVO
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 1. Configurar Microservicio (RabbitMQ)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'],
      queue: 'governance_flows_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  const config = new DocumentBuilder()
    .setTitle('Governance Hub API')
    .setDescription('API para la detección y gestión de flujos de Shadow IT')
    .setVersion('1.0')
    .addTag('Flows')
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // 2. Arrancar Microservicio y HTTP
  app.enableCors(); // Habilitar CORS para permitir solicitudes desde el frontend
  await app.startAllMicroservices(); // RabbitMQ
  await app.listen(3000);            // HTTP
}
bootstrap();