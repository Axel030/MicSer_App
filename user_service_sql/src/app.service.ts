import {
  Injectable,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entity/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ApiResponse } from './interfaces/api-response.interface';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Usuario)
    private readonly userRepo: Repository<Usuario>,
    private readonly jwtService: JwtService,
    @Inject('USER_SERVICE_MONGO') private readonly client: ClientProxy,
  ) {}

  // ================================================
  // 🔹 Obtener usuario con perfil (SQL + Mongo)
  // ================================================
  async getUserWithProfile(id: number): Promise<ApiResponse> {
    try {
      const user = await this.userRepo.findOneBy({ id });
      if (!user) {
        console.log(`❌ Usuario con ID ${id} no encontrado`);
        return {
          status: 'error',
          code: HttpStatus.NOT_FOUND,
          message: 'Usuario no encontrado',
        };
      }

      const profile = await firstValueFrom(
        this.client.send({ cmd: 'get_profile_by_id_unico' }, { id_unico: user.unique_id }),
      );

      console.log(`✅ Usuario ${user.correo_electronico} y perfil obtenidos correctamente`);
      return {
        status: 'success',
        code: HttpStatus.OK,
        message: 'Usuario obtenido correctamente',
        data: { ...user, perfil: profile || null },
      };
    } catch (error) {
      console.error('🔥 Error al obtener usuario con perfil:', error);
      return {
        status: 'error',
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error interno al obtener usuario y perfil',
      };
    }
  }

  // ================================================
  // 🔹 Crear usuario
  // ================================================
  
  async createUser(data: Partial<Usuario>): Promise<ApiResponse> {
    try {
      // Verificar duplicado
      const existing = await this.userRepo.findOne({
        where: { correo_electronico: data.correo_electronico },
      });

      if (existing) {
        console.log(`⚠️ El correo ${data.correo_electronico} ya está registrado`);
        return {
          status: 'error',
          code: HttpStatus.CONFLICT,
          message: 'El correo electrónico ya está registrado',
        };
      }

      const hash = await bcrypt.hash(data.contrasena, 10);
      const user = this.userRepo.create({ ...data, contrasena: hash });
      const savedUser = await this.userRepo.save(user);

      // Emitir evento a Mongo
      await this.client.emit('user_created', {
        id_unico: savedUser.unique_id,
      });

      console.log(`✅ Usuario creado exitosamente: ${savedUser.correo_electronico}`);
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
      console.error('🔥 Error al crear usuario:', error);
      return {
        status: 'error',
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error interno al crear el usuario',
      };
    }
  }

  // ================================================
  // 🔹 Actualizar usuario
  // ================================================
  async updateUser(id: number, data: Partial<Usuario>): Promise<ApiResponse> {
    try {
      const user = await this.userRepo.findOneBy({ id });
      if (!user) {
        console.log(`⚠️ Usuario con ID ${id} no encontrado`);
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
      const updated = await this.userRepo.save(user);

      console.log(`✅ Usuario con ID ${id} actualizado correctamente`);
      return {
        status: 'success',
        code: HttpStatus.OK,
        message: 'Usuario actualizado correctamente',
        data: updated,
      };
    } catch (error) {
      console.error('🔥 Error al actualizar usuario:', error);
      return {
        status: 'error',
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error interno al actualizar usuario',
      };
    }
  }

  // ================================================
  // 🔹 Eliminar usuario
  // ================================================
  async deleteUser(id: number): Promise<ApiResponse> {
    try {
      const result = await this.userRepo.delete(id);
      if (result.affected === 0) {
        console.log(`⚠️ Intento de eliminar usuario inexistente con ID ${id}`);
        return {
          status: 'error',
          code: HttpStatus.NOT_FOUND,
          message: 'Usuario no encontrado para eliminar',
        };
      }

      console.log(`🗑️ Usuario con ID ${id} eliminado correctamente`);
      return {
        status: 'success',
        code: HttpStatus.NO_CONTENT,
        message: 'Usuario eliminado correctamente',
      };
    } catch (error) {
      console.error('🔥 Error al eliminar usuario:', error);
      return {
        status: 'error',
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error interno al eliminar usuario',
      };
    }
  }

  // ================================================
  // 🔹 Login
  // ================================================
  async login(correo: string, contrasena: string): Promise<ApiResponse> {
    try {
      const usuario = await this.userRepo.findOne({
        where: { correo_electronico: correo },
      });

      if (!usuario) {
        console.log(`❌ Usuario no encontrado: ${correo}`);
        return {
          status: 'error',
          code: HttpStatus.NOT_FOUND,
          message: 'Usuario no encontrado',
        };
      }

      const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);
      if (!contrasenaValida) {
        console.log(`⚠️ Contraseña incorrecta para usuario: ${correo}`);
        return {
          status: 'error',
          code: HttpStatus.UNAUTHORIZED, // 401: acceso no autorizado
          message: 'Contraseña incorrecta',
        };
      }

      const payload = {
        sub: usuario.id,
        correo_electronico: usuario.correo_electronico,
        unique_id: usuario.unique_id,
      };

      console.log(`✅ Login exitoso: ${correo}`);
      return {
        status: 'success',
        code: HttpStatus.OK,//200
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
      console.error('🔥 Error en login:', error);
      return {
        status: 'error',
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error interno en el inicio de sesión',
      };
    }
  }

  // ================================================
  // 🔹 Actualizar perfil en Mongo
  // ================================================
  async updateUserProfile(data: { id_unico: string; [key: string]: any }): Promise<ApiResponse> {
    try {
      const result = await firstValueFrom(
        this.client.send({ cmd: 'update_profile_by_unique_id' }, data),
      );

      console.log(`✅ Perfil actualizado en Mongo para id_unico: ${data.id_unico}`);
      return {
        status: 'success',
        code: HttpStatus.OK,
        message: 'Perfil actualizado correctamente en MongoDB',
        data: result,
      };
    } catch (error) {
      console.error('🔥 Error al actualizar perfil en Mongo:', error);
      return {
        status: 'error',
        code: HttpStatus.BAD_GATEWAY, // error entre servicios
        message: 'Error al comunicar con el servicio de MongoDB',
      };
    }
  }
}
