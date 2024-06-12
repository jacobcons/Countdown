export function errorHandler(err, req, res, next) {
    console.error(err);
    return res.status(500).json({ message: 'Something went wrong!' });
}
export function notFound(req, res) {
    return res
        .status(404)
        .json({ message: `Cannot ${req.method} ${req.originalUrl}` });
}
