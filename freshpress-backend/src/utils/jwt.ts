import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_SECRET || 'dev_access_secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret';
const ACCESS_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export interface TokenPayload {
  userId: string;
  role: string;
}

export const generateTokens = (payload: TokenPayload) => {
  const accessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN as any });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN as any });
  
  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
};
