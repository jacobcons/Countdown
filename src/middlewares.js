import { CustomError, createError } from './utils.js';
/* errors */
export function errorHandler(err, req, res, next) {
    if (!(err instanceof CustomError)) {
        err = createError('Something went wrong!', 500);
    }
    const customErr = err;
    return res.status(customErr.statusCode).json(customErr.response);
}
export function notFound(req, res) {
    throw createError(`Cannot ${req.method} ${req.originalUrl}`, 404);
}
