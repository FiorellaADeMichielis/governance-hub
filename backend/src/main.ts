import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar validación global de DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  //CONFIGURACIÓN DE SWAGGER 
  const config = new DocumentBuilder()
    .setTitle('Governance Hub API')
    .setDescription('API para la detección y gestión de flujos de Shadow IT')
    .setVersion('1.0')
    .addTag('Flows') 
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  
  // documentación disponible en la ruta: /api/docs
  SwaggerModule.setup('api/docs', app, document);
  // --------------------------------

  await app.listen(3000);
}
bootstrap();