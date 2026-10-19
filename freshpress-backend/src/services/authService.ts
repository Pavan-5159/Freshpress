import { otpService } from './otpService';
import { AppError } from '../utils/errors';
import { prisma } from '../config/database';
import { userRepository } from '../repositories/userRepository';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';
import { Role } from '@prisma/client';

export const authService = {
  async requestOtp(phone: string) {
    return otpService.createAndSendOtp(phone);
  },

  async verifyOtpAndLogin(phone: string, otp: string) {
    const verification = otpService.verifyOtp(phone, otp);
    if (!verification.valid) {
      throw new AppError(verification.message || 'Invalid OTP', 400);
    }

    let user = await userRepository.findByPhone(phone);
    if (!user) {
      // Create new customer if they don't exist
      user = await userRepository.createUser(phone, Role.CUSTOMER);
    }

    if (!user.isActive) {
      throw new AppError('User account is inactive.', 403);
    }

    // Now that all database operations succeeded, we can safely delete the OTP
    otpService.deleteOtp(phone);

    const tokens = generateTokens({ userId: user.id, role: user.role });
    return { user, tokens };
  },

  async refreshToken(token: string) {
    try {
      const payload = verifyRefreshToken(token);
      
      const user = await userRepository.findById(payload.userId);
      if (!user || !user.isActive) {
        throw new AppError('User not found or inactive', 403);
      }

      const tokens = generateTokens({ userId: user.id, role: user.role });
      return { tokens };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Invalid or expired refresh token', 401);
    }
  },

  async getMe(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  },

  async loginWithEmail(email: string, password?: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    if (password && user.password !== password) {
      throw new AppError('Invalid credentials', 401);
    }
    if (!user.isActive) {
      throw new AppError('User account is inactive.', 403);
    }
    const tokens = generateTokens({ userId: user.id, role: user.role });
    return { user, tokens };
  },

  async loginWithSocial(provider: string, token: string) {
    // In a real app, verify the token with Google/Apple/Firebase here
    // For now, we mock the verified email based on the token
    const email = `user_${token}@${provider}.com`;
    let user = await userRepository.findByEmail(email);
    
    if (!user) {
      // Create user with dummy phone since phone is required in schema
      user = await prisma.user.create({
        data: {
          email,
          phone: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`, // Dummy phone
          isPhoneVerified: true,
          role: Role.CUSTOMER
        }
      });
    }

    if (!user.isActive) {
      throw new AppError('User account is inactive.', 403);
    }

    const tokens = generateTokens({ userId: user.id, role: user.role });
    return { user, tokens };
  }
};
