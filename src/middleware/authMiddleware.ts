
import { Request, Response, NextFunction } from 'express';
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import { AuthService } from '../services/AuthService';

export interface AuthRequest extends Request {
  user?: { id: number; email: string };
}

const authService = new AuthService();

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).send('Access denied. No token provided.');
  }

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    req.user = decoded as { id: number; email: string };
    next();
  } catch (ex) {
    if (ex instanceof TokenExpiredError) {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return res.status(401).send('Access token expired and no refresh token provided.');
      }

      const newTokens = await authService.refreshAccessToken(refreshToken);
      if (newTokens) {
        res.setHeader('Authorization', `Bearer ${newTokens.accessToken}`);
        try {
          const decoded = jwt.verify(newTokens.accessToken, 'your_jwt_secret');
          req.user = decoded as { id: number; email: string };
          next();
        } catch (error) {
          return res.status(400).send('Invalid token after refresh.');
        }
      } else {
        return res.status(401).send('Invalid refresh token.');
      }
    } else {
      return res.status(400).send('Invalid token.');
    }
  }
};
