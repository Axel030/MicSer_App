import { Injectable, NotFoundException, HttpStatus, UnauthorizedException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entity/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ApiResponse } from './interfaces/api-response.interface'; // 👈 importa la interfaz

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Usuario)
    private readonly courseRepo: Repository<Usuario>,
    private readonly jwtService: JwtService,
    @Inject('USER_SERVICE_MONGO') private readonly client: ClientProxy,
  ) {}

  // Obtener usuario con perfil (SQL + Mongo)
  async getUserWithProfile(id: number): Promise<ApiResponse> {
    const user = await this.courseRepo.findOneBy({ id });
    if (!user) {
      return {
        status: 'error',
        code: HttpStatus.NOT_FOUND,
        message: 'Usuario no encontrado',
      };
    }

    const profile = await firstValueFrom(
      this.client.send({ cmd: 'get_profile_by_id_unico' }, { id_unico: user.unique_id }),
    );

    return {
      status: 'success',
      code: HttpStatus.OK,
      message: 'Usuario obtenido correctamente',
      data: { ...user, perfil: profile || null },
    };
  }

  // Crear usuario
  async createUser(data: Partial<Usuario>): Promise<ApiResponse> {
    try {
      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(data.contrasena, salt);
      const user = this.courseRepo.create({ ...data, contrasena: hash });
      const savedUser = await this.courseRepo.save(user);

      // Emitir evento a Mongo
      await this.client.emit('user_created', {
        id_unico: savedUser.unique_id,
      });

      return {
        status: 'success',
        code: HttpStatus.CREATED,
        message: 'Usuario creado correctamente',
        data: {
          id: savedUser.id,
          nombre: savedUser.nombre,
          correo_electronico: savedUser.correo_electronico,
          unique_id: savedUser.unique_id,
        },
      };
    } catch (error) {
      console.error('Error al crear usuario:', error);
      return {
        status: 'error',
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al crear usuario',
      };
    }
  }

  // Actualizar usuario
  async updateUser(id: number, data: Partial<Usuario>): Promise<ApiResponse> {
    const user = await this.courseRepo.findOneBy({ id });
    if (!user) {
      return {
        status: 'error',
        code: HttpStatus.NOT_FOUND,
        message: 'Usuario no encontrado',
      };
    }

    if (data.contrasena) {
      const salt = await bcrypt.genSalt();
      data.contrasena = await bcrypt.hash(data.contrasena, salt);
    }

    Object.assign(user, data);
    const updated = await this.courseRepo.save(user);

    return {
      status: 'success',
      code: HttpStatus.OK,
      message: 'Usuario actualizado correctamente',
      data: updated,
    };
  }

  // Eliminar usuario
  async deleteUser(id: number): Promise<ApiResponse> {
    const result = await this.courseRepo.delete(id);
    if (result.affected === 0) {
      return {
        status: 'error',
        code: HttpStatus.NOT_FOUND,
        message: 'Usuario no encontrado',
      };
    }

    return {
      status: 'success',
      code: HttpStatus.OK,
      message: 'Usuario eliminado correctamente',
    };
  }

  // Login
  async login(correo: string, contrasena: string): Promise<ApiResponse> {
    try {
      const usuario = await this.courseRepo.findOne({
        where: { correo_electronico: correo },
      });

      if (!usuario) {
        return {
          status: 'error',
          code: HttpStatus.NOT_FOUND,
          message: 'Usuario no encontrado',
        };
      }

      const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);
      if (!contrasenaValida) {
        return {
          status: 'error',
          code: HttpStatus.UNAUTHORIZED,
          message: 'Contraseña incorrecta',
        };
      }

      const payload = {
        sub: usuario.id,
        correo_electronico: usuario.correo_electronico,
        unique_id: usuario.unique_id,
      };

      return {
        status: 'success',
        code: HttpStatus.OK,
        message: 'Inicio de sesión exitoso',
        data: {
          access_token: this.jwtService.sign(payload),
          user: {
            id: usuario.id,
            nombre: usuario.nombre,
            correo_electronico: usuario.correo_electronico,
            unique_id: usuario.unique_id,
          },
        },
      };
    } catch (error) {
      console.error('Error en login:', error);
      return {
        status: 'error',
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error interno al iniciar sesión',
      };
    }
  }

  // Actualizar perfil en Mongo
  async updateUserProfile(data: { id_unico: string; [key: string]: any }): Promise<ApiResponse> {
    try {
      const result = await firstValueFrom(
        this.client.send({ cmd: 'update_profile_by_unique_id' }, data),
      );

      return {
        status: 'success',
        code: HttpStatus.OK,
        message: 'Perfil actualizado correctamente',
        data: result,
      };
    } catch (error) {
      console.error('Error al actualizar perfil en Mongo:', error);
      return {
        status: 'error',
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al actualizar perfil en MongoDB',
      };
    }
  }
}
