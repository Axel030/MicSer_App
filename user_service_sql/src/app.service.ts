import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entity/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Usuario)
    private readonly courseRepo: Repository<Usuario>,
    private readonly jwtService: JwtService,
  ) {}

  // Obtener todos los usuarios
  findAll(): Promise<Usuario[]> {
    return this.courseRepo.find();
  }

  // Buscar usuario por correo
  async findByEmail(correo_electronico: string): Promise<Usuario> {
    const user = await this.courseRepo.findOneBy({ correo_electronico });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  // Crear usuario con hash de contraseña
  async createUser(data: Partial<Usuario>): Promise<Usuario> {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(data.contrasena, salt);
    const user = this.courseRepo.create({ ...data, contrasena: hash });
    return this.courseRepo.save(user);
  }

  // Actualizar usuario
  async updateUser(id: number, data: Partial<Usuario>): Promise<Usuario> {
    const user = await this.courseRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    // Si actualiza la contraseña, la hasheamos
    if (data.contrasena) {
      const salt = await bcrypt.genSalt();
      data.contrasena = await bcrypt.hash(data.contrasena, salt);
    }

    Object.assign(user, data);
    return this.courseRepo.save(user);
  }

  // Eliminar usuario
  async deleteUser(id: number): Promise<{ message: string }> {
    const result = await this.courseRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Usuario no encontrado');
    return { message: 'Usuario eliminado correctamente' };
  }

  // Login
  async login(correo_electronico: string, contrasena: string) {
    const user = await this.findByEmail(correo_electronico);
    const isMatch = await bcrypt.compare(contrasena, user.contrasena);
    if (!isMatch) throw new UnauthorizedException('Contraseña incorrecta');

    const payload = { sub: user.id, correo_electronico: user.correo_electronico };
    return { access_token: this.jwtService.sign(payload) };
  }
}
