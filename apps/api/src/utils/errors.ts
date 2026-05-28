export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(code: string, message: string, statusCode: number) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}

export function validationError(message: string): AppError {
  return new AppError("VALIDATION_ERROR", message, 400);
}

export function unauthorizedError(message = "Unauthorized"): AppError {
  return new AppError("UNAUTHORIZED", message, 401);
}

export function forbiddenError(message = "Forbidden"): AppError {
  return new AppError("FORBIDDEN", message, 403);
}

export function notFoundError(message = "Not found"): AppError {
  return new AppError("NOT_FOUND", message, 404);
}

export function conflictError(message: string): AppError {
  return new AppError("CONFLICT", message, 409);
}
