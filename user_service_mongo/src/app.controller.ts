import { Controller } from '@nestjs/common';
import { EventPattern, Payload, MessagePattern } from '@nestjs/microservices';
import { AppService } from './app.service';
import { PerfilUsuario } from './schemas/usuario.schema';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // ðŸ‘‡ Esto escucha los eventos emitidos desde SQL
  @EventPattern('user_created')
  async handleUserCreated(@Payload() data: { id_unico: string }) {
    console.log('ðŸ“¥ Nuevo perfil creado en Mongo con id_unico:', data.id_unico);
    return this.appService.create({ id_unico: data.id_unico });
  }

  // Los demÃ¡s mÃ©todos sÃ­ pueden seguir con @MessagePattern (son request/response)


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
// ðŸ”¹ Escucha solicitudes de actualizaciÃ³n de perfil
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


  
  
  // documentos: guarda una url
  @MessagePattern({ cmd: 'docs.save.one' })
  async docsSaveOne(@Payload() data: { id_unico: string, slot: 'dpi'|'foto_dpi'|'penal'|'policial', url: string }) {
    return this.appService.save_doc_one(data)
  }

  // documentos: guarda varias urls
  @MessagePattern({ cmd: 'docs.save.many' })
  async docsSaveMany(@Payload() data: { id_unico: string, items: { slot: 'dpi'|'foto_dpi'|'penal'|'policial', url: string }[] }) {
    return this.appService.save_doc_many(data)
  }

  // documentos: obtiene todas las urls
  @MessagePattern({ cmd: 'docs.get.all' })
  async docsGetAll(@Payload() data: { id_unico: string }) {
    return this.appService.get_docs(data.id_unico)
  }
}
