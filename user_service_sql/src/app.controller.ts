import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';
import { Usuario } from './entity/user.entity';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Obtener todos los usuarios
  @MessagePattern({ cmd: 'get_users' })
  findAll(): Promise<Usuario[]> {
    return this.appService.findAll();
  }
  
// Obtener usuario SQL + perfil de Mongo
@MessagePattern({ cmd: 'get_user_with_profile' })
async getUserWithProfile(@Payload() data: { id: number }) {
  return this.appService.getUserWithProfile(data.id);
}


  // Crear un nuevo usuario
  @MessagePattern({ cmd: 'create_user' })
  async createUser(@Payload() data: Partial<Usuario>): Promise<Usuario> {
    return this.appService.createUser(data);
  }

  // Buscar usuario por correo
  @MessagePattern({ cmd: 'find_by_email' })
  async findByEmail(@Payload() data: { correo_electronico: string }): Promise<Usuario> {
    return this.appService.findByEmail(data.correo_electronico);
  }

  // Actualizar usuario
  @MessagePattern({ cmd: 'update_user' })
  async updateUser(@Payload() data: { id: number; [key: string]: any }): Promise<Usuario> {
    const { id, ...rest } = data;
    return this.appService.updateUser(id, rest);
  }

  // Eliminar usuario
  @MessagePattern({ cmd: 'delete_user' })
  async deleteUser(@Payload() data: { id: number }): Promise<{ message: string }> {
    return this.appService.deleteUser(data.id);
  }

  // Login
  // Login
  @MessagePattern({ cmd: 'login' })
  async login(@Payload() data: { correo_electronico: string; contrasena: string }) {
    return this.appService.login(data.correo_electronico, data.contrasena);
  }

}
