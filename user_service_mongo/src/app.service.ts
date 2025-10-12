import { Injectable , NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PerfilUsuario, PerfilUsuarioDocument } from './schemas/usuario.schema';
import { user_documents } from './schemas/user_documents.schema';

@Injectable()
export class AppService {

  constructor(
    @InjectModel(PerfilUsuario.name)
    private readonly perfilUsuarioModel: Model<PerfilUsuarioDocument>,
    @InjectModel(user_documents.name) private readonly docsModel: Model<any>,
  ) {}


   // ðŸ”¹ Crear perfil cuando SQL lo emite
  async create(data: Partial<PerfilUsuario>) {
    const perfil = new this.perfilUsuarioModel({
      id_unico: data.id_unico,
    });
    return perfil.save();
  }

  // Actualizar perfil por id
  async update(id: string, data: Partial<PerfilUsuario>): Promise<PerfilUsuario | null> {
    return this.perfilUsuarioModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  // Eliminar perfil por id
  async delete(id: string): Promise<PerfilUsuario | null> {
    return this.perfilUsuarioModel.findByIdAndDelete(id).exec();
  }

  // Buscar perfil por id_unico (para relacionar con Postgres)
  async findByIdUnico(id_unico: string): Promise<PerfilUsuario | null> {
    return this.perfilUsuarioModel.findOne({ id_unico }).exec();
  }
/////////////////////////////////////////////////////////////////////////////////////
  // Actualizar por id_unico
async updateProfileByUniqueId(data: { id_unico: string; [key: string]: any }) {
    const { id_unico, ...updates } = data;

    const perfil = await this.perfilUsuarioModel.findOneAndUpdate(
      { id_unico },
      { $set: updates },
      { new: true },
    );

    if (!perfil) {
      throw new NotFoundException(`Perfil con id_unico ${id_unico} no encontrado`);
    }

    console.log('âœ… Perfil actualizado:', perfil);
    return perfil;
  }


// Eliminar por id_unico
  async deleteByUniqueId(id_unico: string): Promise<PerfilUsuario | null> {
    return this.perfilUsuarioModel.findOneAndDelete({ id_unico }).exec();
  }

  // Buscar perfil por id_unico
  async findByIdUnico1(id_unico: string): Promise<PerfilUsuario | null> {
    return this.perfilUsuarioModel.findOne({ id_unico }).exec();
  }

  /////////////////////////////////////////////////////////
    // guarda una url en un slot
  async save_doc_one(data: { id_unico: string, slot: 'dpi'|'foto_dpi'|'penal'|'policial', url: string }) {
    const d = await this.docsModel.findOne({ id_unico: data.id_unico }) || await this.docsModel.create({ id_unico: data.id_unico, slots: {} })
    d.slots = { ...d.slots, [data.slot]: data.url }
    await d.save()
    return { id_unico: d.id_unico, slots: d.slots }
  }

  // guarda varias urls
  async save_doc_many(data: { id_unico: string, items: { slot: 'dpi'|'foto_dpi'|'penal'|'policial', url: string }[] }) {
    const d = await this.docsModel.findOne({ id_unico: data.id_unico }) || await this.docsModel.create({ id_unico: data.id_unico, slots: {} })
    for (const it of data.items) { d.slots[it.slot] = it.url }
    await d.save()
    return { id_unico: d.id_unico, slots: d.slots }
  }

  // obtiene todas las urls
  async get_docs(id_unico: string) {
    const d = await this.docsModel.findOne({ id_unico })
    return { id_unico, slots: d?.slots || {} }
  }
