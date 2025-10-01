import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: 'user_created_queue',   // 👈 aquí la cola que ya existe
        queueOptions: { durable: true },
      },
    },
  );
  await app.listen();
  console.log('📚 Usuario_service_mongo escuchando eventos en cola: user_created_queue');
}
bootstrap();
