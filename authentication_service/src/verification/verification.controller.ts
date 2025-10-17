  import { Controller } from '@nestjs/common';
  import { MessagePattern, Payload } from '@nestjs/microservices';
  import { VerificationService } from './verification.service';
  import { ApiResponse } from '../interfaces/api-response.interface';

  @Controller()
  export class VerificationController {
    constructor(private readonly verificationService: VerificationService) {}

    // Enviar OTP (email o SMS)
    @MessagePattern({ cmd: 'send_otp' })
    async sendOtp(
      @Payload() data: { channel: 'email' | 'sms'; target: string },
    ): Promise<ApiResponse> {
      return this.verificationService.generateAndSend(data.channel, data.target);
    }

    // Verificar OTP
    @MessagePattern({ cmd: 'verify_otp' })
    async verifyOtp(@Payload() data: { code: string }): Promise<ApiResponse> {
      return this.verificationService.verifyOtp(data.code);
    }
  }
