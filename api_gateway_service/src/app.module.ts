import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ClientsModule.register([
  {
    name: 'USER_SERVICE_SQL',
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'user_sql_queue',
      queueOptions: { durable: true },
    },
  },
  {
    name: 'USER_SERVICE_MONGO',
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'user_mongo_queue',
      queueOptions: { durable: true },
    },
  },
  {
    name: 'AUTH_SERVICE', // 👈 Nuevo microservicio
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'auth_queue', // 👈 asegúrate de usar el mismo nombre que en authentication_service/main.ts
      queueOptions: { durable: true },
    },
  },
  {
    name: 'ENTERPRISE_JOBS_SQL',
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'enterprise_jobs_sql_queue',
      queueOptions: { durable: true },
    },
  },
  {
    name: 'ENTERPRISE_JOBS_MONGO',
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'enterprise_jobs_mongo_queue',
      queueOptions: { durable: true },
    },
  },
  {
    name: 'JOB_APPLICATION_SQL',
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'job_application_sql_queue',
      queueOptions: { durable: true },
    },
  },
  {
    name: 'JOB_APPLICATION_MONGO',
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'job_application_mongo_queue',
      queueOptions: { durable: true },
    },
  },

]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
