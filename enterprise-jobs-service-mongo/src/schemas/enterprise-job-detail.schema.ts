import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'enterprise_job_details', timestamps: true })
export class EnterpriseJobDetail extends Document {
  @Prop({ required: true, unique: true })
  uuid: string; // 🔗 Igual que en SQL

  @Prop()
  company_uuid: string;

  @Prop()
  title: string;

  @Prop()
  urgency: boolean;

  @Prop()
  job_type: string;

  @Prop()
  location_name: string;

  // ✅ Requisitos
  @Prop({ type: [String], default: [] })
  required_documents: string[]; // Ej: ["Antecedentes penales", "Herramientas"]

  @Prop({ type: [String], default: [] })
  optional_requirements: string[]; // Ej: ["Horas extra", "Disponibilidad fines de semana"]

  // ✅ Descripción extendida
  @Prop({ type: String })
  job_description: string;

  // ✅ Niveles o etiquetas adicionales
  @Prop({ type: String })
  level: string; // Ej: "Profesional", "Técnico especializado"

  @Prop({ type: String })
  city: string; // Ej: "Retalhuleu"

  @Prop({ type: String })
  schedule: string; // Ej: "00:00 am/pm - 00:00 am/pm"
}

export const EnterpriseJobDetailSchema = SchemaFactory.createForClass(EnterpriseJobDetail);
