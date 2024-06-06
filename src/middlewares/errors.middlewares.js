import { createError, CustomError } from '../utils/errors.utils.js';
export function errorHandler(err, req, res, next) {
    console.error(err.stack);
    if (!(err instanceof CustomError)) {
        err = createError('Something went wrong!', 500);
    }
    const customErr = err;
    return res.status(customErr.statusCode).json(customErr.response);
}
export function notFound(req) {
    throw createError(`Cannot ${req.method} ${req.originalUrl}`, 404);
}
