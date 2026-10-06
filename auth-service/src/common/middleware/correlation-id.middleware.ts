import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

/**
 * Correlation ID Middleware (Auth Service)
 *
 * Reads X-Correlation-Id from Gateway or generates a fallback UUIDv4.
 * Attaches the tracing ID to both incoming request headers and outgoing response headers.
 */
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const incomingId =
      req.headers['x-correlation-id'] || req.headers['x-request-id'];

    const correlationId =
      (Array.isArray(incomingId) ? incomingId[0] : incomingId) || randomUUID();

    req.headers['x-correlation-id'] = correlationId;
    res.setHeader('X-Correlation-Id', correlationId);

    next();
  }
}
