/* errors */
export class CustomError extends Error {
    statusCode;
    response;
    constructor(message, statusCode, response) {
        super(message);
        this.statusCode = statusCode;
        this.response = response;
    }
}
export function createError(message, statusCode) {
    return new CustomError(message, statusCode, { message });
}
