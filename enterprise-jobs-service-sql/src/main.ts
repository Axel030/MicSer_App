import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'enterprise_jobs_sql_queue',
      queueOptions: { durable: true },
    },
  });
  await app.listen();
  console.log('✅ enterprise-jobs-service-sql is running');
}
bootstrap();
