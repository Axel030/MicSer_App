import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // 📥 Escucha el evento del SQL
  @EventPattern('enterprise_job_created')
  async handleJobCreated(@Payload() data: { uuid: string }) {
    console.log('📥 Evento recibido (enterprise_job_created):', data);
    if (!data?.uuid) {
      console.warn('⚠️ Evento recibido sin UUID válido.');
      return;
    }

    // Crear el detalle en Mongo con solo el uuid
    return this.appService.createJobDetail({ uuid: data.uuid });
  }

  //Actualizar detalle de empleo
  @MessagePattern({ cmd: 'update_job_detail' })
  async handleUpdateJobDetail(data: { uuid: string; updateData: any }) {
    return this.appService.updateJobDetail(data.uuid, data.updateData);
  }

}
