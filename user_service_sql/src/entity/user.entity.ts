import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

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
}
