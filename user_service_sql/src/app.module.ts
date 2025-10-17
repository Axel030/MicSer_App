import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Usuario } from './entity/user.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [

    ConfigModule.forRoot({ isGlobal: true }), // primero
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
      entities: [Usuario],
      synchronize: false,
    }),
  }),
    TypeOrmModule.forFeature([Usuario]),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
    // <-- Cliente RabbitMQ para emitir eventos
    ClientsModule.register([
      {
        name: 'USER_SERVICE_MONGO',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'user_created_queue',
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}