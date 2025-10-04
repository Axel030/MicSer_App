import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import sgMail from '@sendgrid/mail';
import fetch from 'node-fetch';

interface OtpEntry {
  code: string;
  expiresAt: number;
}

@Injectable()
export class VerificationService {
  private cfg = {
    sendgrid: {
      api_key: process.env.sendgrid_api_key || '',
      from: process.env.email_from || 'no-reply@example.com',
    },
    sms: {
      url: process.env.unimtx_api_url || '',
      key: process.env.unimtx_api_key || '',
      sender: process.env.sms_sender || 'app',
    },
    otp: {
      ttl_min: Number(process.env.otp_ttl_minutes || 10),
      len: Number(process.env.otp_length || 6),
    },
  };

  private lastOtp: { target: string; code: string; expiresAt: number } | null = null;



  // Guarda temporalmente OTP por target
  private otpStore = new Map<string, OtpEntry>();

  private genOtp(len: number): string {
    let c = '';
    while (c.length < len) c += crypto.randomInt(0, 10).toString();
    return c.slice(0, len);
  }

  async sendEmailOtp(to: string, code: string) {
    if (!this.cfg.sendgrid.api_key) throw new Error('falta sendgrid_api_key');
    sgMail.setApiKey(this.cfg.sendgrid.api_key);
    await sgMail.send({
      to,
      from: this.cfg.sendgrid.from,
      subject: 'Tu código OTP',
      html: this.getHtmlTemplate(code), // plantilla bonita
    });
    return 'sent';
  }

  async sendSmsOtp(to: string, code: string) {
    if (!this.cfg.sms.url || !this.cfg.sms.key) throw new Error('falta unimtx_api_url o unimtx_api_key');
    const url = `${this.cfg.sms.url}&accessKeyId=${encodeURIComponent(this.cfg.sms.key)}`;
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
    if (!res.ok) throw new Error(`SMS fail ${res.status}`);
    return 'sent';
  }

  async generateAndSend(channel: 'email' | 'sms', target: string) {
  const otp = this.genOtp(this.cfg.otp.len);
  const expiresAt = Date.now() + this.cfg.otp.ttl_min * 60000;

  // Guardar en variable temporal
  this.lastOtp = { target, code: otp, expiresAt };

  if (channel === 'email') {
    await this.sendEmailOtp(target, otp);
  } else {
    await this.sendSmsOtp(target, otp);
  }

  return { message: 'OTP enviado' };
}


  async verifyOtp(code: string): Promise<boolean> {
  if (!this.lastOtp) return false;

  if (Date.now() > this.lastOtp.expiresAt) {
    this.lastOtp = null; // eliminar si expiró
    return false;
  }

  const valid = this.lastOtp.code === code;
  if (valid) this.lastOtp = null; // eliminar si es correcto

  return valid;
}


  // Ejemplo de plantilla HTML simple
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