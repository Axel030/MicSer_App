import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnterpriseJobDetail, EnterpriseJobDetailSchema } from './schemas/enterprise-job-detail.schema';

@Module({
  imports: [
    // 🔗 Conexión a la base de datos de MongoDB
    MongooseModule.forRoot('mongodb://localhost:27017/enterprise_jobs'),

    // 📦 Registro del schema que manejará los detalles extendidos
    MongooseModule.forFeature([
      { name: EnterpriseJobDetail.name, schema: EnterpriseJobDetailSchema },
    ]),

    // 📨 Conexión con RabbitMQ para recibir el evento del SQL
    ClientsModule.register([
      {
        name: 'ENTERPRISE_JOBS_SERVICE_MONGO',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'enterprise_job_queue',
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}