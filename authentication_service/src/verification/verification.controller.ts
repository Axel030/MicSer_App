import { Controller, HttpStatus } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { VerificationService } from './verification.service';
import { ApiResponse } from '../interfaces/api-response.interface';

@Controller()
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  // ================================================
  // 🔹 Enviar OTP (por correo o SMS)
  // ================================================
  @MessagePattern({ cmd: 'send_otp' })
  async sendOtp(@Payload() data: { channel: 'email' | 'sms'; target: string },): Promise<ApiResponse> {
    try {
      return await this.verificationService.generateAndSend(data.channel, data.target);
    } catch (error) {
      console.error('🔥 Error en send_otp:', error);
      return {
        status: 'error',
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error interno al enviar OTP',
      };
    }
  }

  // ================================================
  // 🔹 Verificar OTP (ahora también recibe correo)
  // ================================================
  @MessagePattern({ cmd: 'verify_otp' })
  async verifyOtp(@Payload() data: { code: string; correo_electronico: string },): Promise<ApiResponse> {
    try {
      return await this.verificationService.verifyOtp(data.code, data.correo_electronico);
    } catch (error) {
      console.error('🔥 Error en verify_otp:', error);
      return {
        status: 'error',
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error interno al verificar OTP',
      };
    }
  }
}
