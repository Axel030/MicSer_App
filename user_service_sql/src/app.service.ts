import { Injectable, UnauthorizedException, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entity/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';


@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Usuario)
    private readonly courseRepo: Repository<Usuario>,
    private readonly jwtService: JwtService,
    @Inject('USER_SERVICE_MONGO') private readonly client: ClientProxy, // <-- RabbitMQ Client
    
  ) {}

  // Obtener todos los usuarios
  findAll(): Promise<Usuario[]> {
    return this.courseRepo.find();
  }

  
// app.service.ts (user_service_sql) // Obtener usuario sql por ID con perfil de Mongo
async getUserWithProfile(id: number) {
  const user = await this.courseRepo.findOneBy({ id });
  if (!user) throw new NotFoundException('Usuario no encontrado');

  const profile = await firstValueFrom(
    this.client.send({ cmd: 'get_profile_by_id_unico' }, { id_unico: user.unique_id }),
  );

  return {
    ...user,
    perfil: profile || null,
  };
}

  // Buscar usuario por correo
  async findByEmail(correo_electronico: string): Promise<Usuario> {
    const user = await this.courseRepo.findOneBy({ correo_electronico });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  // Crear usuario con hash de contraseña
  async createUser(data: Partial<Usuario>): Promise<Usuario> {
    // Hasheamos la contraseña
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(data.contrasena, salt);

    // Creamos el usuario
    const user = this.courseRepo.create({ ...data, contrasena: hash });
    const savedUser = await this.courseRepo.save(user);

    // Emitimos evento a RabbitMQ para que Mongo cree perfil
    await this.client.emit('user_created', {
      id_unico: savedUser.unique_id, // <-- id único de SQL
      nombre: savedUser.nombre,
      correo_electronico: savedUser.correo_electronico,
  });

  return savedUser;
}

  // Actualizar usuario
  async updateUser(id: number, data: Partial<Usuario>): Promise<Usuario> {
    const user = await this.courseRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    // Si actualiza la contraseña, la hasheamos
    if (data.contrasena) {
      const salt = await bcrypt.genSalt();
      data.contrasena = await bcrypt.hash(data.contrasena, salt);
    }

    Object.assign(user, data);
    return this.courseRepo.save(user);
  }

  // Eliminar usuario
  async deleteUser(id: number): Promise<{ message: string }> {
    const result = await this.courseRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Usuario no encontrado');
    return { message: 'Usuario eliminado correctamente' };
  }

  // Login
  // app.service.ts
async login(correo: string, contrasena: string) {
  try {
    const usuario = await this.courseRepo.findOne({
      where: { correo_electronico: correo },
    });

    if (!usuario) {
      return { status: 'error', message: 'Usuario no encontrado' };
    }

    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!contrasenaValida) {
      return { status: 'error', message: 'Contraseña incorrecta' };
    }

    const payload = { sub: usuario.id, correo_electronico: usuario.correo_electronico };

    return { status: 'success', message: 'Bienvenido de nuevo', access_token: this.jwtService.sign(payload) };
  } catch (error) {
    console.error(error);
    return { status: 'error', message: 'Ocurrió un error interno' };
  }
}


}
