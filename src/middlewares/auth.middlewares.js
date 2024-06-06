import { createError } from '../utils/errors.utils.js';
import { redis } from '../db/connection.js';
export async function verifySessionToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw createError('No token provided', 401);
    }
    const sessionToken = authHeader.split(' ')[1];
    const userId = parseInt((await redis.get(`sessionToken:${sessionToken}`)), 10);
    if (!userId) {
        throw createError('Invalid token', 401);
    }
    req.user = { id: userId, sessionToken };
    next();
}
