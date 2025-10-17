import { Controller } from '@nestjs/common';
import { MessagePattern, EventPattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';
import { ApiResponse } from './interfaces/api-response.interface';
import { PerfilUsuario } from './schemas/usuario.schema';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // =========================
  //      EVENTOS DESDE SQL
  // =========================
  @EventPattern('user_created')
  async handleUserCreated(@Payload() data: { id_unico: string }): Promise<ApiResponse> {
    console.log('📥 Evento recibido: user_created →', data.id_unico);
    return this.appService.createProfile({ id_unico: data.id_unico });
  }

  // =========================
  //      OPERACIONES CRUD
  // =========================

  @MessagePattern({ cmd: 'get_profile_by_id_unico' })
  async getProfileByIdUnico(@Payload() data: { id_unico: string }): Promise<ApiResponse<PerfilUsuario>> {
    return this.appService.findProfileByUniqueId(data.id_unico);
  }

  @MessagePattern({ cmd: 'update_profile_by_unique_id' })
  async updateProfileByUniqueId(
    @Payload() data: { id_unico: string; [key: string]: any },
  ): Promise<ApiResponse<PerfilUsuario>> {
    return this.appService.updateProfileByUniqueId(data);
  }

  @MessagePattern({ cmd: 'delete_profile_by_unique_id' })
  async deleteProfileByUniqueId(@Payload() data: { id_unico: string }): Promise<ApiResponse> {
    return this.appService.deleteProfileByUniqueId(data.id_unico);
  }
}
