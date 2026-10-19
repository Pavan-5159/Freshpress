import axios from 'axios';

export const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Sends an OTP SMS via Twilio or MSG91 depending on which environment variables are set.
 * Returns true if sent successfully, false otherwise.
 */
export async function sendOtpSms(phone: string, otp: string): Promise<boolean> {
  // Format phone number: ensure country code is present (defaulting to 91 for India if exactly 10 digits)
  let formattedPhone = phone.trim();
  if (formattedPhone.length === 10) {
    formattedPhone = `91${formattedPhone}`;
  }

  // 1. Check for MSG91 configuration
  const msg91AuthKey = process.env.MSG91_AUTH_KEY;
  const msg91TemplateId = process.env.MSG91_TEMPLATE_ID;
  const msg91SenderId = process.env.MSG91_SENDER_ID;

  if (msg91AuthKey && msg91TemplateId) {
    try {
      console.log(`[OTP] Attempting to send OTP via MSG91 to ${formattedPhone}...`);
      
      const payload = {
        template_id: msg91TemplateId,
        recipients: [
          {
            mobiles: formattedPhone,
            // Provide various common template variable placeholders for maximum compatibility
            otp: otp,
            otp_code: otp,
            code: otp,
            VAR1: otp,
            Param1: otp
          }
        ]
      };
      
      if (msg91SenderId) {
        (payload as any).sender = msg91SenderId;
      }

      const response = await axios.post('https://control.msg91.com/api/v5/flow/', payload, {
        headers: {
          'authkey': msg91AuthKey,
          'Content-Type': 'application/json',
          'accept': 'application/json'
        }
      });

      console.log('[OTP] MSG91 Response:', response.data);
      if (response.data && (response.data.type === 'success' || response.status === 200)) {
        return true;
      }
    } catch (error: any) {
      console.error('[OTP] MSG91 Error sending SMS:', error?.response?.data || error.message || error);
    }
  }

  // 2. Check for Twilio configuration
  const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_FROM_NUMBER || process.env.TWILIO_PHONE_NUMBER;

  if (twilioAccountSid && twilioAuthToken && twilioFrom) {
    try {
      console.log(`[OTP] Attempting to send OTP via Twilio to ${formattedPhone}...`);
      
      // Twilio requires a leading '+' for international phone numbers
      let twilioPhone = formattedPhone;
      if (!twilioPhone.startsWith('+')) {
        twilioPhone = `+${twilioPhone}`;
      }

      // Format from number as well
      let twilioFromFormatted = twilioFrom.trim();
      if (!twilioFromFormatted.startsWith('+') && /^\d+$/.test(twilioFromFormatted)) {
        twilioFromFormatted = `+${twilioFromFormatted}`;
      }

      const params = new URLSearchParams();
      params.append('To', twilioPhone);
      params.append('From', twilioFromFormatted);
      params.append('Body', `Your FreshPress verification code is ${otp}. Valid for 5 minutes.`);

      const authHeader = 'Basic ' + Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64');

      const response = await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
        params.toString(),
        {
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      console.log('[OTP] Twilio Response status:', response.status);
      if (response.status === 200 || response.status === 201) {
        return true;
      }
    } catch (error: any) {
      console.error('[OTP] Twilio Error sending SMS:', error?.response?.data || error.message || error);
    }
  }

  // 3. Fallback warning
  console.warn(
    `[OTP] SMS not sent to ${formattedPhone} because neither MSG91 nor Twilio credentials are fully configured in the .env file.`
  );
  return false;
}
