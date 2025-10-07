import { Controller } from '@nestjs/common';
import { EventPattern, Payload, MessagePattern } from '@nestjs/microservices';
import { AppService } from './app.service';
import { PerfilUsuario } from './schemas/usuario.schema';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // 👇 Esto escucha los eventos emitidos desde SQL
  @EventPattern('user_created')
  async handleUserCreated(@Payload() data: { id_unico: string }) {
    console.log('📥 Nuevo perfil creado en Mongo con id_unico:', data.id_unico);
    return this.appService.create({ id_unico: data.id_unico });
  }

  // Los demás métodos sí pueden seguir con @MessagePattern (son request/response)


  @MessagePattern({ cmd: 'get_profile_by_id_unico' })
  async findByIdUnico(@Payload() payload: { id_unico: string }) {
    return this.appService.findByIdUnico(payload.id_unico);
  }

  // Actualizar perfil (id viene directo + resto de datos planos)
  @MessagePattern({ cmd: 'update_profile' })
  async update(@Payload() payload: { id: string; [key: string]: any }) {
    const { id, ...data } = payload;
    return this.appService.update(id, data);
  }

  // Actualizar por id_unico
// 🔹 Escucha solicitudes de actualización de perfil
  @MessagePattern({ cmd: 'update_profile_by_unique_id' })
async updateByUniqueId(@Payload() payload: { id_unico: string; [key: string]: any }) {
  return this.appService.updateProfileByUniqueId(payload);
}


  // Eliminar perfil
  @MessagePattern({ cmd: 'delete_profile' })
  async delete(@Payload() payload: { id: string }) {
    return this.appService.delete(payload.id);
  }

// Eliminar por id_unico
  @MessagePattern({ cmd: 'delete_profile_by_unique_id' })
  async deleteByUniqueId(@Payload() payload: { id_unico: string }) {
    return this.appService.deleteByUniqueId(payload.id_unico);
  }
  
}
