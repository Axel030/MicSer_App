import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { VerificationService } from './verification.service';

@Controller()
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @MessagePattern({ cmd: 'send_otp' })
  async sendOtp(data: { channel: 'email' | 'sms'; target: string }) {
    const result = await this.verificationService.generateAndSend(data.channel, data.target);
    console.log(`✅ OTP enviado a ${data.target} por ${data.channel}`);
    return result;
  }

  @MessagePattern({ cmd: 'verify_otp' })
  async verifyOtp(data: { code: string }) {
    const isValid = await this.verificationService.verifyOtp(data.code);
    if (isValid) {
      console.log(`✅ Código OTP correcto`);
    } else {
      console.log(`❌ Código OTP incorrecto o expirado`);
    }
    return { valid: isValid };
  }
}

