import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { VerificationService } from './verification.service';
import { VerificationController } from './verification.controller';
import { VERIFICATION_CONFIG } from './config/verification.config';
import type { VerificationConfig } from './config/verification.config';

@Module({
  imports: [ConfigModule],
  controllers: [VerificationController],
  providers: [
    {
      provide: VERIFICATION_CONFIG,
      useFactory: (configService: ConfigService): VerificationConfig => {
        return {
          sendgrid: {
            api_key: configService.get<string>('SENDGRID_API_KEY') || '',
            from: configService.get<string>('EMAIL_FROM') || 'no-reply@example.com',
          },
          sms: {
            url: configService.get<string>('UNIMTX_API_URL') || '',
            key: configService.get<string>('UNIMTX_API_KEY') || '',
            sender: configService.get<string>('SMS_SENDER') || 'app',
          },
          otp: {
            ttl_min: configService.get<number>('OTP_TTL_MINUTES') || 10,
            len: configService.get<number>('OTP_LENGTH') || 6,
          },
        };
      },
      inject: [ConfigService],
    },
    VerificationService,
  ],
  exports: [VerificationService],
})
export class VerificationModule {}