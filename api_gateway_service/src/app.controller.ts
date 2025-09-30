import { Controller, Get, Post, Put, Delete, Inject, Body, Param  } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { get } from 'http';

@Controller()
export class AppController {
  constructor(
    @Inject('USER_SERVICE') private readonly Loginclient: ClientProxy,
    @Inject('USER_SERVICE_MONGO') private readonly DatosClient: ClientProxy,
  ) {}
  //Servicio de autenticacion y gestion de usuarios (user_service_sql)
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

  //Servicio de gestion de perfiles (user_service_mongo)
  // Obtener todos los perfiles de usuario
  @Get('profiles')
  getAllProfiles() {
    return this.DatosClient.send({ cmd: 'get_profiles' }, {});
  }

  // Crear un perfil de usuario
  @Post('profiles')
  createProfile(@Body() body: any) {
    return this.DatosClient.send({ cmd: 'create_profile' }, body);
  }

  // Buscar perfil por id_unico
  @Get('profiles/:id_unico')
  getProfileByIdUnico(@Param('id_unico') id_unico: string) {
    return this.DatosClient.send({ cmd: 'get_profile_by_id_unico' }, { id_unico });
  }

  // Actualizar perfil
  @Put('profiles/:id')
  updateProfile(@Param('id') id: string, @Body() body: any) {
    return this.DatosClient.send({ cmd: 'update_profile' }, { id, ...body });
  }

  // Eliminar perfil
  @Delete('profiles/:id')
  deleteProfile(@Param('id') id: string) {
   return this.DatosClient.send({ cmd: 'delete_profile' }, { id });
  }

}

