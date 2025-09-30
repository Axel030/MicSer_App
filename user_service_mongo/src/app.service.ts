import { Injectable } from '@nestjs/common';
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

  // Crear perfil
  async create(perfilData: Partial<PerfilUsuario>): Promise<PerfilUsuario> {
    const newPerfil = new this.perfilUsuarioModel(perfilData);
    return newPerfil.save();
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
}
