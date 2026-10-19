import { User, Role } from '@prisma/client';
import { prisma } from '../config/database';

export const userRepository = {
  async findByPhone(phone: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { phone },
    });
  },

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  async findByGoogleId(googleId: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { googleId },
    });
  },

  async findByAppleId(appleId: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { appleId },
    });
  },

  async createUser(phone: string, role: Role = Role.CUSTOMER): Promise<User> {
    return prisma.user.create({
      data: {
        phone,
        role,
        isPhoneVerified: true,
      },
    });
  },

  async updateProfile(id: string, data: Partial<User>): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  },

  async updateRefreshToken(id: string, token: string | null) {
    // Note: If you want to store refresh tokens in DB for revocation, 
    // you would add a field in the User model. Since it's not in the 
    // current schema, we skip DB storage or assume it's validated via secret.
    return true; 
  }
};
