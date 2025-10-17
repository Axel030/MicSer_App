export interface VerificationConfig {
  sendgrid: {
    api_key: string;
    from: string;
  };
  sms: {
    url: string;
    key: string;
    sender: string;
  };
  otp: {
    ttl_min: number;
    len: number;
  };
}

export const VERIFICATION_CONFIG = 'VERIFICATION_CONFIG';