export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public errors: any[] = [],
    public isOperational = true
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg: string, errors: any[] = []) {
    return new ApiError(400, msg, errors);
  }

  static unauthorized(msg = 'Нэвтрэх шаардлагатай') {
    return new ApiError(401, msg);
  }

  static forbidden(msg = 'Хандах эрхгүй') {
    return new ApiError(403, msg);
  }

  static notFound(msg = 'Олдсонгүй') {
    return new ApiError(404, msg);
  }

  static conflict(msg: string) {
    return new ApiError(409, msg);
  }

  static tooMany(msg = 'Хэт олон хүсэлт') {
    return new ApiError(429, msg);
  }

  static internal(msg = 'Серверийн алдаа') {
    return new ApiError(500, msg, [], false);
  }
}