import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  // Servicio que escucha la cola de creación de usuarios desde SQL
  const appCreated = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: 'user_created_queue',
        queueOptions: { durable: true },
      },
    },
  );
  appCreated.listen();
  console.log('📥 Escuchando user_created_queue');

  // Servicio que escucha la cola de CRUD propia de Mongo
  const appMongo = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: 'user_mongo_queue',
        queueOptions: { durable: true },
      },
    },
  );
  appMongo.listen();
  console.log('📚 Escuchando user_mongo_queue');
}

bootstrap();
