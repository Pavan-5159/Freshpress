import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { z } from 'zod';
import { authService } from '../services/authService';

const requestOtpSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number format'),
});

const verifyOtpSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number format'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

const emailLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().optional(),
});

const socialLoginSchema = z.object({
  provider: z.enum(['google', 'apple']),
  token: z.string().min(1, 'Token is required'),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const authController = {
  async sendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone } = requestOtpSchema.parse(req.body);
      const result = await authService.requestOtp(phone);
      
      res.status(200).json({
        message: 'OTP sent successfully',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  },

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone, otp } = verifyOtpSchema.parse(req.body);
      const result = await authService.verifyOtpAndLogin(phone, otp);
      
      res.status(200).json({
        message: 'Logged in successfully',
        user: {
          id: result.user.id,
          phone: result.user.phone,
          role: result.user.role,
        },
        tokens: result.tokens,
      });
    } catch (error) {
      next(error);
    }
  },

  async loginWithEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = emailLoginSchema.parse(req.body);
      const result = await authService.loginWithEmail(email, password);
      
      res.status(200).json({
        message: 'Logged in successfully',
        user: {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
        },
        tokens: result.tokens,
      });
    } catch (error) {
      next(error);
    }
  },

  async loginWithSocial(req: Request, res: Response, next: NextFunction) {
    try {
      const { provider, token } = socialLoginSchema.parse(req.body);
      const result = await authService.loginWithSocial(provider, token);
      
      res.status(200).json({
        message: 'Logged in successfully',
        user: {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
        },
        tokens: result.tokens,
      });
    } catch (error) {
      next(error);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = refreshTokenSchema.parse(req.body);
      const result = await authService.refreshToken(refreshToken);
      
      res.status(200).json({
        message: 'Tokens refreshed successfully',
        tokens: result.tokens,
      });
    } catch (error) {
      next(error);
    }
  },

  async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      // req.user is set by authenticate middleware
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      const userId = req.user.userId;
      const user = await authService.getMe(userId);
      
      res.status(200).json({
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async logout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      // In a more robust system, add the refresh token to a blacklist or delete from DB.
      // For stateless JWTs, we tell the client to discard the tokens.
      res.status(200).json({
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  }
};
