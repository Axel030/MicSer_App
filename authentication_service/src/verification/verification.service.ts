import { Injectable, HttpStatus } from '@nestjs/common';
import * as crypto from 'crypto';
import sgMail from '@sendgrid/mail';
import fetch from 'node-fetch';
import { VERIFICATION_CONFIG } from './config/verification.config';
import type { VerificationConfig } from './config/verification.config';
import { Inject } from '@nestjs/common';
import { ApiResponse } from '../interfaces/api-response.interface';

interface OtpEntry {
  code: string;
  expiresAt: number;
}

@Injectable()
export class VerificationService {
  private otpStore = new Map<string, OtpEntry>();

  constructor(
    @Inject(VERIFICATION_CONFIG) private readonly cfg: VerificationConfig,
  ) {}

  // ================================================
  // 🔹 Generar OTP aleatorio
  // ================================================
  private genOtp(len: number): string {
    let c = '';
    while (c.length < len) c += crypto.randomInt(0, 10).toString();
    return c.slice(0, len);
  }

  // ================================================
  // 🔹 Enviar OTP por correo electrónico
  // ================================================
  private async sendEmailOtp(to: string, code: string): Promise<void> {
    if (!this.cfg.sendgrid.api_key) throw new Error('Falta SENDGRID_API_KEY');
    sgMail.setApiKey(this.cfg.sendgrid.api_key);
    await sgMail.send({
      to,
      from: this.cfg.sendgrid.from,
      subject: 'Tu código OTP',
      html: this.getHtmlTemplate(code),
    });
  }

  // ================================================
  // 🔹 Enviar OTP por SMS
  // ================================================
  private async sendSmsOtp(to: string, code: string): Promise<void> {
    if (!this.cfg.sms.url || !this.cfg.sms.key)
      throw new Error('Falta UNIMTX_API_URL o UNIMTX_API_KEY');

    const url = `${this.cfg.sms.url}&accessKeyId=${encodeURIComponent(
      this.cfg.sms.key,
    )}`;
    const payload = {
      to,
      text: `Código OTP: ${code}. Válido ${this.cfg.otp.ttl_min} min.`,
      signature: this.cfg.sms.sender,
    };

    const res = await fetch(url, {
      method: 'post',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`Error al enviar SMS (${res.status})`);
  }

  // ================================================
  // 🔹 Generar y enviar OTP (Email o SMS)
  // ================================================
  async generateAndSend(
    channel: 'email' | 'sms',
    target: string,
  ): Promise<ApiResponse> {
    try {
      const otp = this.genOtp(this.cfg.otp.len);
      const expiresAt = Date.now() + this.cfg.otp.ttl_min * 60000;

      this.otpStore.set(target, { code: otp, expiresAt });

      if (channel === 'email') {
        await this.sendEmailOtp(target, otp);
      } else {
        await this.sendSmsOtp(target, otp);
      }

      console.log(`✅ OTP enviado a ${target} por ${channel}: ${otp}`);

      return {
        status: 'success',
        code: HttpStatus.OK,
        message: `OTP enviado correctamente a ${target}`,
        data: { target, channel },
      };
    } catch (error) {
      console.error('🔥 Error al generar o enviar OTP:', error.message);
      return {
        status: 'error',
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error interno al generar o enviar OTP',
      };
    }
  }

  // ================================================
// 🔹 Verificar OTP (mejorada con intentos y validación de correo)
// ================================================
  async verifyOtp(code: string, correo_electronico: string): Promise<ApiResponse> {
    try {
      // 1️⃣ Obtener OTP guardado por correo
      const entry = this.otpStore.get(correo_electronico);

      if (!entry) {
        console.log('❌ No se encontró un OTP para este correo');
        return {
          status: 'error',
          code: HttpStatus.NOT_FOUND,
          message: 'No se encontró un OTP para este correo. Solicite uno nuevo.',
        };
      }

      // 2️⃣ Registrar intentos (en memoria temporal)
      if (!(entry as any).attempts) (entry as any).attempts = 0;
      (entry as any).attempts++;

      // 3️⃣ Si excede 3 intentos
      if ((entry as any).attempts > 3) {
        this.otpStore.delete(correo_electronico);
        console.log(`🚫 OTP bloqueado para ${correo_electronico} por demasiados intentos`);
        return {
          status: 'error',
          code: HttpStatus.TOO_MANY_REQUESTS, // 429
          message: 'Has superado el número máximo de intentos (3). Solicita un nuevo OTP.',
        };
     }

      // 4️⃣ Validar código
      if (entry.code !== code) {
        console.log(`❌ Código OTP incorrecto para ${correo_electronico} (intento ${(entry as any).attempts})`);
        return {
          status: 'error',
          code: HttpStatus.BAD_REQUEST,
          message: `Código OTP incorrecto. Intento ${(entry as any).attempts} de 3.`,
        };
      }

      // 5️⃣ Verificar expiración
      if (Date.now() > entry.expiresAt) {
        this.otpStore.delete(correo_electronico);
        console.log(`⚠️ Código OTP expirado para ${correo_electronico}`);
        return {
          status: 'error',
          code: HttpStatus.GONE,
          message: 'El código OTP ha expirado. Solicita uno nuevo.',
        };
      }

      // ✅ Si todo está bien
      this.otpStore.delete(correo_electronico);
      console.log(`✅ OTP verificado correctamente para ${correo_electronico}`);

      return {
        status: 'success',
        code: HttpStatus.OK,
        message: `OTP verificado correctamente para ${correo_electronico}`,
        data: { correo_electronico, valid: true },
      };
      }catch (error) {
      console.error('🔥 Error al verificar OTP:', error.message);
      return {
        status: 'error',
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error interno al verificar OTP',
      };
    }
  }


  // ================================================
  // 🔹 Plantilla HTML para el correo OTP
  // ================================================
  private getHtmlTemplate(code: string) {
    return `
      <div style="font-family: sans-serif; text-align: center; padding: 30px; background-color: #f0f4f8;">
        <h2 style="color: #007BFF;">Código de verificación</h2>
        <p style="font-size: 18px; color: #333;">Tu código OTP es:</p>
        <div style="font-size: 32px; font-weight: bold; color: #0056b3; margin: 20px 0;">${code}</div>
        <p style="font-size: 14px; color: #666;">Vence en ${this.cfg.otp.ttl_min} minutos</p>
      </div>
    `;
  }
}
