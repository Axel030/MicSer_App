import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Company } from './entities/company.entity';
import { EnterpriseJob } from './entities/enterprise-job.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '123456',
      database: 'proyectofinal',
      entities: [Company, EnterpriseJob],
      synchronize: false,
    }),
    TypeOrmModule.forFeature([Company, EnterpriseJob]),

    // Configuración de cliente RabbitMQ para emitir eventos
    ClientsModule.register([
  // 1️⃣ Cliente para enviar a Mongo
  {
    name: 'ENTERPRISE_JOBS_MONGO',
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'enterprise_job_mongo_queue',
      queueOptions: { durable: true },
    },
  },

  // 2️⃣ Cliente para recibir del API Gateway
  {
    name: 'ENTERPRISE_JOBS_SQL_CLIENT',
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://localhost:5672'],
      queue: 'enterprise_job_sql_queue',
      queueOptions: { durable: true },
    },
  },
]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
