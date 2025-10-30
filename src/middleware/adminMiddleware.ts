
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';
import { userRepository } from '../repositories/UserRepository';

export const adminMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.id) {
    return res.status(401).send('Access denied. User not authenticated.');
  }

  const user = await userRepository.findOne({
    where: { id: req.user.id },
    relations: ["role"],
  });

  if (!user || user.role.name !== 'admin') {
    return res.status(403).send('Access denied. Admin role required.');
  }

  next();
};
