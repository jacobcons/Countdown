/* auth */
import { NextFunction, Request, Response } from 'express';
import { redis } from '../db/connection.js';

export async function verifySessionToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const sessionToken = authHeader.split(' ')[1];
  const userId = parseInt(
    (await redis.get(`sessionToken:${sessionToken}`)) as string,
    10,
  );
  if (!userId) {
    return res.status(401).json({ message: 'Invalid token' });
  }
  req.user = { id: userId, sessionToken };
  next();
}
