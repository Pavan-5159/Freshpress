import { generateOtp, sendOtpSms } from '../utils/twilioClient';

// In-memory store for OTPs (In production, use Redis)
interface OtpRecord {
  otp: string;
  expiresAt: number;
  attempts: number;
}
const otpStore = new Map<string, OtpRecord>();

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 3;

// Clean up expired OTPs every 15 minutes (Issue #11 partial fix)
setInterval(() => {
  const now = Date.now();
  for (const [phone, record] of otpStore.entries()) {
    if (now > record.expiresAt) {
      otpStore.delete(phone);
    }
  }
}, 15 * 60 * 1000);

export const otpService = {
  async createAndSendOtp(phone: string): Promise<{ success: boolean; devOtp?: string }> {
    const otp = generateOtp();
    const expiresAt = Date.now() + OTP_TTL_MS;
    
    otpStore.set(phone, { otp, expiresAt, attempts: 0 });

    const sent = await sendOtpSms(phone, otp);

    const isDev = process.env.NODE_ENV !== 'production';
    return { 
      success: sent || isDev,
      ...(isDev && { devOtp: otp }) // Include OTP in response only in dev mode
    };
  },

  verifyOtp(phone: string, inputOtp: string): { valid: boolean; message?: string } {
    const record = otpStore.get(phone);

    if (!record) {
      return { valid: false, message: 'OTP not requested or expired.' };
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(phone);
      return { valid: false, message: 'OTP has expired.' };
    }

    if (record.attempts >= MAX_ATTEMPTS) {
      otpStore.delete(phone);
      return { valid: false, message: 'Maximum attempts reached. Request a new OTP.' };
    }

    if (record.otp !== inputOtp) {
      record.attempts += 1;
      return { valid: false, message: 'Invalid OTP.' };
    }

    // Success
    // We do not delete the OTP here so that if subsequent DB operations fail,
    // the user can retry verification without having to request a new OTP.
    return { valid: true };
  },

  deleteOtp(phone: string) {
    otpStore.delete(phone);
  }
};
