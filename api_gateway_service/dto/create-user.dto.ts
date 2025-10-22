import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio.' })
  @MaxLength(100)
  nombre: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido es obligatorio.' })
  @MaxLength(100)
  apellido: string;

  @IsEmail({}, { message: 'El correo electrónico no es válido.' })
  @MaxLength(150)
  correo_electronico: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
  @MaxLength(100)
  contrasena: string;

  @IsString()
  @Matches(/^\+\d{1,4}$/, { message: 'El código de país debe tener el formato +123.' })
  codigo_pais: string;

  @IsString()
  @Matches(/^\d{6,15}$/, { message: 'El teléfono debe contener entre 6 y 15 dígitos numéricos.' })
  telefono: string;
}
