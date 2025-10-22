import { IsEmail, IsString, Length } from 'class-validator';

export class ConfirmRegisterDto {
  @IsEmail({}, { message: 'El correo electrónico no es válido.' })
  correo_electronico: string;

  @IsString()
  @Length(4, 8, { message: 'El código OTP debe tener entre 4 y 8 caracteres.' })
  code: string;
}
