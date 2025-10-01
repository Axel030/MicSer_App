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
]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
