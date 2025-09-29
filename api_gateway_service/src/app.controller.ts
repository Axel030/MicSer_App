import { Controller, Get, Post, Put, Delete, Inject, Body, Param } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(
    @Inject('USER_SERVICE') private readonly Loginclient: ClientProxy,
  ) {}

  // Login
  @Post('login')
  login(@Body() body: { username: string; password: string }) {
    return this.Loginclient.send({ cmd: 'login' }, body);
  }

  // Obtener todos los usuarios
  @Get('users')
  getAllUsers() {
    return this.Loginclient.send({ cmd: 'get_users' }, {});
  }

  // Crear un nuevo usuario
  @Post('users')
  createUser(@Body() body: any) {
    return this.Loginclient.send({ cmd: 'create_user' }, body);
  }

  // Buscar usuario por correo
  @Get('users/email/:correo_electronico')
  findByEmail(@Param('correo_electronico') correo_electronico: string) {
    return this.Loginclient.send({ cmd: 'find_by_email' }, { correo_electronico });
  }

  // Actualizar usuario
  @Put('users/:id')
  updateUser(@Param('id') id: number, @Body() body: any) {
    return this.Loginclient.send({ cmd: 'update_user' }, { id, ...body });
  }

  // Eliminar usuario
  @Delete('users/:id')
  deleteUser(@Param('id') id: number) {
    return this.Loginclient.send({ cmd: 'delete_user' }, { id });
  }
}

