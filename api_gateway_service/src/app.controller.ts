import { Controller, Get, Post, Put, Delete, Inject, Body, Param  } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { get } from 'http';


@Controller()
export class AppController {
  constructor(
    @Inject('USER_SERVICE_SQL') private readonly Loginclient: ClientProxy,
    @Inject('USER_SERVICE_MONGO') private readonly DatosClient: ClientProxy,
  ) {}
  
  //Servicio de autenticacion y gestion de usuarios (user_service_sql)
  // Login
 @Post('login')
  login(@Body() body: { correo_electronico: string; contrasena: string }) {
    return this.Loginclient.send({ cmd: 'login' }, body);
}


  // Obtener todos los usuarios
  @Get('users')
  getAllUsers() {
    return this.Loginclient.send({ cmd: 'get_users' }, {});
  }


// Obtener usuario con su perfil (SQL + Mongo)
@Get('users/:id/with-profile')
getUserWithProfile(@Param('id') id: string) {
  return this.Loginclient.send({ cmd: 'get_user_with_profile' }, { id: Number(id) });
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

  @Put('profiles/unique/:id_unico')
updateProfileByUniqueId(@Param('id_unico') id_unico: string, @Body() body: any) {
  return this.DatosClient.send({ cmd: 'update_profile_by_unique_id' }, { id_unico, ...body });
}

  // Eliminar perfil
  @Delete('profiles/:id')
  deleteProfile(@Param('id') id: string) {
   return this.DatosClient.send({ cmd: 'delete_profile' }, { id });
  }

}

