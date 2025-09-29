import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Usuario } from './entity/user.entity';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
