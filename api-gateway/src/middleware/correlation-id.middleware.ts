import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

/**
 * Correlation ID Middleware
 *
 * Injects a unique distributed tracing ID (`X-Correlation-Id`) on every
 * incoming request and attaches it to the outgoing response headers.
 * The API Gateway forwards this ID to downstream microservices (Auth, Backend, ML).
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
