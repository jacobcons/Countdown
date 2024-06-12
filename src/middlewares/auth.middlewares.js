import { redis } from '../db/connection.js';
export async function verifySessionToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }
    const sessionToken = authHeader.split(' ')[1];
    const userId = parseInt((await redis.get(`sessionToken:${sessionToken}`)), 10);
    if (!userId) {
        return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = { id: userId, sessionToken };
    next();
}
