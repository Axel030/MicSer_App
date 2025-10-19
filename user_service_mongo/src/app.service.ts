import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PerfilUsuario, PerfilUsuarioDocument } from './schemas/usuario.schema';
import { ApiResponse } from './interfaces/api-response.interface';
import { user_documents } from './schemas/user_documents.schema';


@Injectable()
export class AppService {
  constructor(
    @InjectModel(PerfilUsuario.name)
    private readonly perfilUsuarioModel: Model<PerfilUsuarioDocument>,
    @InjectModel(user_documents.name)
    private readonly DoumnetURLusuarioModel: Model<PerfilUsuarioDocument>,
    
  ) {}

  // =========================================
  //       CREAR PERFIL Y DOCUMENTO
  // =========================================
    async createProfile(data: Partial<PerfilUsuario>): Promise<ApiResponse> {
    try {
      const perfil = new this.perfilUsuarioModel({ id_unico: data.id_unico });
      const document = new this.DoumnetURLusuarioModel({ id_unico: data.id_unico });

      // Guardar ambos documentos
      const [savedPerfil, savedDocument] = await Promise.all([perfil.save(), document.save()]);

      console.log('✅ Perfil y Documento URL creados con ID único →', data.id_unico);

      return {
        status: 'success',
        code: HttpStatus.CREATED,
        message: 'Perfil y Documento URL creado correctamente en MongoDB',
        data: { perfil: savedPerfil, documento: savedDocument },
      };
    } catch (error) {
      console.error('🔥 Error al crear perfil y documento URL:', error);
      return {
        status: 'error',
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al crear el perfil y documento URL',
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
    } catch (error) {
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


  // =========================
  //   Actualizar Documento/Imagen Url por id_unico
  // =========================

  async actualizarDocumentoURL (data: { id_unico: string; [key: string]: any }): Promise<ApiResponse> {
    try {
      const { id_unico, ...updates } = data;
      const documentourl = await this.DoumnetURLusuarioModel.findOneAndUpdate(
        { id_unico },
        { $set: updates },
        { new: true },
      );

      if (!documentourl) {
        return {
          status: 'error',
          code: HttpStatus.NOT_FOUND,
          message: `Documento/imagen con id_unico ${id_unico} no encontrado`,
        };
      }

      return {
        status: 'success',
        code: HttpStatus.OK,
        message: 'Documento/imagen actualizado correctamente',
        data: documentourl,
      };
    } catch {
      return {
        status: 'error',
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al actualizar el Documento/imagen',
      };
    }
  }


    // =========================
    // Obtener documentos de un usuario por id_unico
    // =========================
  async getDocumentsByUniqueId(id_unico: string): Promise<ApiResponse> {
    try {
      const documents = await this.DoumnetURLusuarioModel.findOne({ id_unico }).exec();

      if (!documents) {
        return {
          status: 'error',
          code: HttpStatus.NOT_FOUND,
          message: `Documentos del usuario con id_unico ${id_unico} no encontrados`,
        };
      }

      return {
        status: 'success',
        code: HttpStatus.OK,
        message: 'Documentos obtenidos correctamente',
        data: documents,
      };
    } catch (error) {
      console.error('🔥 Error al obtener documentos:', error);
      return {
        status: 'error',
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al obtener documentos',
      };
    }
  }

}
