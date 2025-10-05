import { Injectable , NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PerfilUsuario, PerfilUsuarioDocument } from './schemas/usuario.schema';

@Injectable()
export class AppService {

  constructor(
    @InjectModel(PerfilUsuario.name)
    private readonly perfilUsuarioModel: Model<PerfilUsuarioDocument>,
  ) {}

  // Obtener todos los perfiles
  async findAll(): Promise<PerfilUsuario[]> {
    return this.perfilUsuarioModel.find().exec();
  }

   // 🔹 Crear perfil cuando SQL lo emite
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

    console.log('✅ Perfil actualizado:', perfil);
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
}
