import { v4 as uuidv4 } from 'uuid';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert } from 'typeorm';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ type: 'uuid', unique: true })
  unique_id: string; // <-- nueva columna para sincronización con Mongo

  @Column({ type: 'varchar', length: 100, nullable: false })
  nombre: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  apellido: string;

  @Column({ type: 'varchar', length: 150, unique: true, nullable: false })
  correo_electronico: string;

  @Column({ type: 'text', nullable: false })
  contrasena: string;

  @Column({ type: 'varchar', length: 5, nullable: false })
  codigo_pais: string; // Ej: +502

  @Column({ type: 'varchar', length: 20, nullable: false })
  telefono: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updated_at: Date;

  // Generar UUID automáticamente antes de insertar
  @BeforeInsert()
  generateUniqueId() {
    this.unique_id = uuidv4();
  }
}
