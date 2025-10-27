import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';
import { ApiResponse } from './interfaces/api-response.interface';
import { EnterpriseJobDetail } from './schemas/enterprise-job-detail.schema';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // 📥 Escucha el evento del SQL
  @EventPattern('enterprise_job_created')
  async handleJobCreated(@Payload() data: { uuid: string }): Promise<ApiResponse> {
    console.log('📥 Evento recibido (enterprise_job_created):', data);
    if (!data?.uuid) {
      console.warn('⚠️ Evento recibido sin UUID válido.');
    }
    // Crear el detalle en Mongo con solo el uuid
    return this.appService.createJobDetail({ uuid: data.uuid });
  }

  //Actualizar detalle de empleo
  @MessagePattern({ cmd: 'update_job_detail' })
  async handleUpdateJobDetail(data: { uuid: string; updateData: any }): Promise<ApiResponse<EnterpriseJobDetail>> {
    return this.appService.updateJobDetail(data.uuid, data.updateData);
  }
  
  @MessagePattern({ cmd: 'get_job_by_uuid' })
  async getJobByUuid(@Payload() data: { uuid: string }) {
    try {
      const job = await this.appService.findByUuid(data.uuid);
      if (!job) {
        return { status: 'error', code: 404, message: 'Trabajo no encontrado' };
      }

      return { status: 'success', code: 200, data: job };
    } catch (error) {
      console.error('❌ Error en get_job_by_uuid (Mongo):', error);
      return { status: 'error', code: 500, message: 'Error interno en Mongo' };
    }
  }

}
