import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Usuario } from './entity/user.entity';
import { ClientsModule, Transport } from '@nestjs/microservices'; 

@Module({
  imports: [
     ConfigModule.forRoot({
      isGlobal: true, // Hace que las variables estén disponibles en todo el proyecto
    }),
    
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '123456',
      database: 'proyectofinal',
      entities: [Usuario],
      synchronize: false,
    }),
    TypeOrmModule.forFeature([Usuario]),

    JwtModule.register({
      secret: 'MI_SECRETO_SUPER_SEGURO', // usa tu variable de entorno en producción
      signOptions: { expiresIn: '1h' },   // duración del token
    }),

    // <-- Cliente RabbitMQ para emitir eventos
    ClientsModule.register([
      {
        name: 'USER_SERVICE_MONGO', // este es el microservicio Mongo
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'], // tu RabbitMQ
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


