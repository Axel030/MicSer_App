import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PerfilUsuarioDocument = PerfilUsuario & Document;

@Schema()
export class PerfilUsuario {
  // 📌 ID único para conectar con SQL (Postgres)
  @Prop({ required: true, unique: true })
  id_unico: string;

  // 📌 Fecha de nacimiento
  @Prop()
  fecha_nacimiento: Date;

  // 📌 Género
  @Prop()
  genero: string;

  // 📌 Identificación (tipo y número)
  @Prop({
    type: {
      tipo: { type: String },
      numero: { type: String },
    },
  })
  identificacion: {
    tipo: string;
    numero: string;
  };

  // 📌 Ubicación (departamento y municipio)
  @Prop({
    type: {
      departamento: { type: String },
      municipio: { type: String },
    },
  })
  ubicacion: {
    departamento: string;
    municipio: string;
  };

  // 📌 Dirección
  @Prop()
  direccion: string;

  // 📌 Descripción
  @Prop()
  descripcion: string;

  // 📌 Categorías (array de strings)
  @Prop({ type: [String] })
  categorias: string[];
}

export const PerfilUsuarioSchema = SchemaFactory.createForClass(PerfilUsuario);

