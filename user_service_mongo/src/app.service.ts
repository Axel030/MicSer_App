import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PerfilUsuario, PerfilUsuarioDocument } from './schemas/usuario.schema';
import { ApiResponse } from './interfaces/api-response.interface';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(PerfilUsuario.name)
    private readonly perfilUsuarioModel: Model<PerfilUsuarioDocument>,
  ) {}

  // =========================
  //       CREAR PERFIL
  // =========================
  async createProfile(data: Partial<PerfilUsuario>): Promise<ApiResponse> {
    try {
      const perfil = new this.perfilUsuarioModel({ id_unico: data.id_unico });
      const saved = await perfil.save();

      return {
        status: 'success',
        code: HttpStatus.CREATED,
        message: 'Perfil creado correctamente en MongoDB',
        data: saved,
      };
    } catch (error) {
      return {
        status: 'error',
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al crear el perfil',
      };
    }
  }

  // =========================
  //   OBTENER PERFIL POR id_unico
  // =========================
  async findProfileByUniqueId(id_unico: string): Promise<ApiResponse> {
    try {
      const perfil = await this.perfilUsuarioModel.findOne({ id_unico }).exec();

      if (!perfil) {
        return {
          status: 'error',
          code: HttpStatus.NOT_FOUND,
          message: `Perfil con id_unico ${id_unico} no encontrado`,
        };
      }

      return {
        status: 'success',
        code: HttpStatus.OK,
        message: 'Perfil encontrado correctamente',
        data: perfil,
      };
    } catch {
      return {
        status: 'error',
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al buscar el perfil',
      };
    }
  }

  // =========================
  //    ACTUALIZAR PERFIL POR id_unico
  // =========================
  async updateProfileByUniqueId(data: { id_unico: string; [key: string]: any }): Promise<ApiResponse> {
    try {
      const { id_unico, ...updates } = data;
      const perfil = await this.perfilUsuarioModel.findOneAndUpdate(
        { id_unico },
        { $set: updates },
        { new: true },
      );

      if (!perfil) {
        return {
          status: 'error',
          code: HttpStatus.NOT_FOUND,
          message: `Perfil con id_unico ${id_unico} no encontrado`,
        };
      }

      return {
        status: 'success',
        code: HttpStatus.OK,
        message: 'Perfil actualizado correctamente',
        data: perfil,
      };
    } catch {
      return {
        status: 'error',
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al actualizar el perfil',
      };
    }
  }

  // =========================
  //    ELIMINAR PERFIL POR id_unico
  // =========================
  async deleteProfileByUniqueId(id_unico: string): Promise<ApiResponse> {
    try {
      const deleted = await this.perfilUsuarioModel.findOneAndDelete({ id_unico }).exec();

      if (!deleted) {
        return {
          status: 'error',
          code: HttpStatus.NOT_FOUND,
          message: `Perfil con id_unico ${id_unico} no encontrado`,
        };
      }

      return {
        status: 'success',
        code: HttpStatus.OK,
        message: 'Perfil eliminado correctamente',
      };
    } catch {
      return {
        status: 'error',
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al eliminar el perfil',
      };
    }
  }
}
