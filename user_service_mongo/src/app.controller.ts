import { Controller } from '@nestjs/common';
import { EventPattern, Payload, MessagePattern } from '@nestjs/microservices';
import { AppService } from './app.service';
import { PerfilUsuario } from './schemas/usuario.schema';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // 👇 Esto escucha los eventos emitidos desde SQL
  @EventPattern('user_created')
  async handleUserCreated(@Payload() data: Partial<PerfilUsuario>) {
    console.log('📥 Evento recibido en Mongo:', data);
    return this.appService.create(data);
  }

  // Los demás métodos sí pueden seguir con @MessagePattern (son request/response)
  @MessagePattern({ cmd: 'get_profiles' })
  async findAll(): Promise<PerfilUsuario[]> {
    return this.appService.findAll();
  }

  @MessagePattern({ cmd: 'create_profile' })
  async create(@Payload() perfilData: Partial<PerfilUsuario>) {
    if (!perfilData.id_unico) throw new Error('El id_unico es obligatorio');
    return this.appService.create(perfilData);
  }

  @MessagePattern({ cmd: 'get_profile_by_id_unico' })
  async findByIdUnico(@Payload() payload: { id_unico: string }) {
    return this.appService.findByIdUnico(payload.id_unico);
  }

  @MessagePattern({ cmd: 'update_profile' })
  async update(@Payload() payload: { id: string; data: Partial<PerfilUsuario> }) {
    return this.appService.update(payload.id, payload.data);
  }

  @MessagePattern({ cmd: 'delete_profile' })
  async delete(@Payload() id: string) {
    return this.appService.delete(id);
  }
}
