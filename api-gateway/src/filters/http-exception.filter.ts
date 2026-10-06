import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Standardized HTTP Exception Filter (RFC 7807 aligned)
 *
 * Ensures all uncaught gateway errors and 4xx/5xx responses return
 * a consistent envelope containing the correlationId.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    let message = 'Internal server error';
    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      message =
        (exceptionResponse as any).message ||
        (exceptionResponse as any).error ||
        message;
    } else if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const correlationId = (request.headers['x-correlation-id'] as string) || '';

    response.status(status).json({
      statusCode: status,
      error: HttpStatus[status] || 'Error',
      message,
      correlationId,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
