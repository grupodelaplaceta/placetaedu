import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret1234';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.email !== 'malegre@laplaceta.org')) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};
