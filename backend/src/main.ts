import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilita validaciones globales para los DTOs
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  // Habilita CORS para que el frontend pueda comunicarse
  app.enableCors();

  // Configura el Consumidor de RabbitMQ
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'], // URL de Docker
      queue: 'flows_ingestion_queue',  // mismo nombre de cola que en el module
      queueOptions: {
        durable: true,
      },
    },
  });

  // Inicia la escucha de microservicios (RabbitMQ) en segundo plano
  await app.startAllMicroservices();
  
  // Inicia la API HTTP (REST)
  await app.listen(3000);
  console.log('API HTTP y Consumer RabbitMQ corriendo en puerto 3000');
}
bootstrap();