import { CustomError, createError } from './utils.js';
import { Request, Response, NextFunction } from 'express';

/* errors */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!(err instanceof CustomError)) {
    err = createError('Something went wrong!', 500);
  }
  const customErr = err as CustomError;
  return res.status(customErr.statusCode).json(customErr.response);
}

export function notFound(req: Request, res: Response) {
  throw createError(`Cannot ${req.method} ${req.originalUrl}`, 404);
}
