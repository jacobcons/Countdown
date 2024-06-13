export function errorHandler(err, req, res, next) {
    if (err?.type === 'entity.parse.failed') {
        return res.status(400).json(err);
    }
    else {
        console.error(err);
    }
    return res.status(500).json({ message: 'Something went wrong!' });
}
export function notFound(req, res) {
    return res
        .status(404)
        .json({ message: `Cannot ${req.method} ${req.originalUrl}` });
}
