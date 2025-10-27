import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JobApplicationLog, JobApplicationLogSchema } from './schemas/job-application-log.schema';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [

    ConfigModule.forRoot({ isGlobal: true }),

    MongooseModule.forRoot('mongodb://localhost:27017/PerfilUsuariosDB'),
    MongooseModule.forFeature([
      { name: JobApplicationLog.name, schema: JobApplicationLogSchema }
      
    ]),
    
    // Registro del microservicio como consumidor de RabbitMQ
    ClientsModule.register([
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
