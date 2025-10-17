import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';
import { Usuario } from './entity/user.entity';
import { ApiResponse } from './interfaces/api-response.interface'; // 👈 crea este archivo (te lo dejo abajo)

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Obtener usuario SQL + perfil de Mongo
  @MessagePattern({ cmd: 'get_user_with_profile' })
  async getUserWithProfile(@Payload() data: { id: number }): Promise<ApiResponse> {
    return this.appService.getUserWithProfile(data.id);
    
  }

  // Actualizar perfil de usuario en Mongo
  @Post('update-profile')
  async updateProfile(@Body() data: { id_unico: string; [key: string]: any }): Promise<ApiResponse> {
    return this.appService.updateUserProfile(data);
  }

  // Crear un nuevo usuario
  @MessagePattern({ cmd: 'create_user' })
  async createUser(@Payload() data: Partial<Usuario>): Promise<ApiResponse> {
    return this.appService.createUser(data);
    
  }

  // Actualizar usuario
  @MessagePattern({ cmd: 'update_user' })
  async updateUser(@Payload() data: { id: number; [key: string]: any }): Promise<ApiResponse> {
    const { id, ...rest } = data;
    return this.appService.updateUser(id, rest);
  }

  // Eliminar usuario
  @MessagePattern({ cmd: 'delete_user' })
  async deleteUser(@Payload() data: { id: number }): Promise<ApiResponse> {
    return this.appService.deleteUser(data.id);
  }

  // Login
  @MessagePattern({ cmd: 'login' })
  async login(@Payload() data: { correo_electronico: string; contrasena: string }): Promise<ApiResponse> {
    return this.appService.login(data.correo_electronico, data.contrasena);
  }
}
