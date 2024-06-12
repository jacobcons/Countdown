/* errors */
import { NextFunction, Request, Response } from 'express';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.error(err);
  return res.status(500).json({ message: 'Something went wrong!' });
}

export function notFound(req: Request, res: Response) {
  return res
    .status(404)
    .json({ message: `Cannot ${req.method} ${req.originalUrl}` });
}
