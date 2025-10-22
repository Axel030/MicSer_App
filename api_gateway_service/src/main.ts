import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // elimina propiedades no definidas en DTO
      forbidNonWhitelisted: true, // lanza error si se manda algo no permitido
      transform: true, // convierte tipos automáticamente
    }),
  );

  await app.listen(3000);
  console.log('🚀 API Gateway en http://localhost:3000');
}
bootstrap();
