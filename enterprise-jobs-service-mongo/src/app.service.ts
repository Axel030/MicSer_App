  import { Injectable, NotFoundException } from '@nestjs/common';
  import { InjectModel } from '@nestjs/mongoose';
  import { Model } from 'mongoose';
  import { EnterpriseJobDetail } from './schemas/enterprise-job-detail.schema';


  @Injectable()
  export class AppService {
    constructor(
      @InjectModel(EnterpriseJobDetail.name)
      private readonly jobDetailModel: Model<EnterpriseJobDetail>,
    ) {}
    // Creat un detalle de trabajo nuevo con solo el campo uuid
    async createJobDetail(data: { uuid: string }) {
      const newJobDetail = new this.jobDetailModel({
        uuid: data.uuid,
      });

      const saved = await newJobDetail.save();
      console.log('✅ Documento creado en Mongo con uuid:', saved.uuid);

      return saved;
    }
    
  // ==========================
  // Actualizar detalle de empleo
  // ==========================
    async updateJobDetail(uuid: string, updateData: Partial<EnterpriseJobDetail>) {
      const updated = await this.jobDetailModel.findOneAndUpdate(
        { uuid },
        { $set: updateData },
        { new: true },
      );

      if (!updated) {
        throw new NotFoundException(`No se encontró el detalle del trabajo con uuid: ${uuid}`);
      }
      console.log(`✅ Detalle de empleo actualizado en Mongo: ${uuid}`);

      return updated;
    }
}