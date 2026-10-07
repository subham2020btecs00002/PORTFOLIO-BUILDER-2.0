import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Request Logger Middleware
 *
 * Emits structured request logs with duration and correlationId.
 * Automatically suppresses /health and / probes to keep production logs clean.
 */
@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    // Suppress heartbeats from cron-job.org and internal health probes
    if (req.path === '/health' || req.path === '/') {
      return next();
    }

    const start = Date.now();
    const correlationId = (req.headers['x-correlation-id'] as string) || '-';

    res.on('finish', () => {
      const duration = Date.now() - start;
      const status = res.statusCode;
      const method = req.method;
      const url = req.originalUrl || req.url;
      const level = status >= 500 ? 'ERROR' : status >= 400 ? 'WARN' : 'INFO';

      console.log(
        `[${level}][Gateway] ${method} ${url} status=${status} duration=${duration}ms [correlationId: ${correlationId}]`,
      );
    });

    next();
  }
}
