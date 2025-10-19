import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EnterpriseJobDetail } from './schemas/enterprise-job-detail.schema';
import { ApiResponse } from './interfaces/api-response.interface';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(EnterpriseJobDetail.name)
    private readonly jobDetailModel: Model<EnterpriseJobDetail>,
  ) {}

  // Creat un detalle de trabajo nuevo con solo el campo uuid
  async createJobDetail(data: { uuid: string }): Promise<ApiResponse> {
  try {
      const newJobDetail = new this.jobDetailModel({
        uuid: data.uuid,
      });

      const saved = await newJobDetail.save();
      console.log('✅ Documento creado en Mongo con uuid:', saved.uuid);

      return {
        status: 'success',
        code: HttpStatus.CREATED,
        message: 'Detalle de trabajo creado correctamente en MongoDB',
        data: saved,
      };
    } catch (error) {
      console.error('🔥 Error al crear el detalle del trabajo:', error);
      return {
        status: 'error',
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al crear el detalle del trabajo',
      };
    }
  }
    
  // ==========================
  // Actualizar detalle de empleo
  // ==========================
  async updateJobDetail(uuid: string, updateData: Partial<EnterpriseJobDetail>): Promise<ApiResponse> {
    try {
      const updated = await this.jobDetailModel.findOneAndUpdate(
        { uuid },
        { $set: updateData },
        { new: true },
      );

      if (!updated) {
        console.log(`⚠️ Detalle de empleo con uuid ${uuid} no encontrado para actualizar`);
        return {
          status: 'error',
          code: HttpStatus.NOT_FOUND,
          message: `Detalle de empleo con uuid ${uuid} no encontrado`,
        };
      
      }
      console.log(`✅ Detalle de empleo con uuid ${uuid} actualizado`);
      return {
        status: 'success',
        code: HttpStatus.OK,
        message: 'Detalle de empleo actualizado correctamente en MongoDB',
        data: updated,
      };
    } catch (error) {
      console.error('🔥 Error al actualizar el detalle del empleo:', error);
      return{
        status: 'error',
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al actualizar el detalle del empleo',
      }
    }
  }
}