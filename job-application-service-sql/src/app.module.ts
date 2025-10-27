import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JobApplication } from './entity/job-application.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: Number(config.get('DB_PORT')),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        entities: [JobApplication],
        synchronize: false,
      }),
    }),
    TypeOrmModule.forFeature([JobApplication]),

    ClientsModule.register([
      {
        name: 'JOB_APPLICATION_MONGO',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'job_application_mongo_queue',
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

    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
