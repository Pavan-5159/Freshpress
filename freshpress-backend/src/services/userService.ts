import { userRepository } from '../repositories/userRepository';

export interface UpdateProfileData {
  name?: string;
  email?: string;
  avatar?: string;
}

/** Get user by ID */
export async function getUserById(userId: string) {
  const user = await userRepository.findById(userId);
  if (!user) return null;
  
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    role: user.role,
    isPhoneVerified: user.isPhoneVerified,
    createdAt: user.createdAt,
  };
}

/** Update user profile */
export async function updateProfile(userId: string, data: UpdateProfileData) {
  // Only pass fields that are in the schema
  const user = await userRepository.updateProfile(userId, {
    name: data.name,
    email: data.email,
  });
  
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    role: user.role,
  };
}
