import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

@Schema({ collection: 'user_documents', timestamps: true })
export class user_documents extends Document {
  @Prop({ required: true, index: true })
  id_unico: string // id unico del usuario

  @Prop({
    type: {
      dpi: { type: String, default: null },
      foto_dpi: { type: String, default: null },
      penal: { type: String, default: null },
      policial: { type: String, default: null }
    },
    default: {}
  })
  slots: {
    dpi?: string | null
    foto_dpi?: string | null
    penal?: string | null
    policial?: string | null
  }
}

export const user_documents_schema = SchemaFactory.createForClass(user_documents)
