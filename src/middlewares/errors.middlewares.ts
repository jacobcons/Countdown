/* errors */
import { NextFunction, Request, Response } from 'express';
import { createError, CustomError } from '../utils/errors.utils.js';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.error(err.stack);

  if (!(err instanceof CustomError)) {
    err = createError('Something went wrong!', 500);
  }
  const customErr = err as CustomError;

  return res.status(customErr.statusCode).json(customErr.response);
}

export function notFound(req: Request) {
  throw createError(`Cannot ${req.method} ${req.originalUrl}`, 404);
}
