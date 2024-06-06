/* errors */
export class CustomError extends Error {
  public statusCode: number;
  public response: object;

  constructor(message: string, statusCode: number, response: object) {
    super(message);
    this.statusCode = statusCode;
    this.response = response;
  }
}

export function createError(message: string, statusCode: number): CustomError {
  return new CustomError(message, statusCode, { message });
}
