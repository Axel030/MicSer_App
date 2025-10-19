import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VerificationModule } from './verification/verification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    VerificationModule,
  ],
})
export class AppModule {}