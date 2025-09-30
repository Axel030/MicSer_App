import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PerfilUsuario, PerfilUsuarioSchema } from './schemas/usuario.schema';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/PerfilUsuariosDB'),
    MongooseModule.forFeature([{ name: PerfilUsuario.name, schema: PerfilUsuarioSchema }]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
