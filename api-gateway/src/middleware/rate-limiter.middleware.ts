import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';

/**
 * Rate Limiter Middleware
 *
 * A lightweight, in-memory per-IP rate limiter.
 * No external Redis required for local/dev environments.
 *
 * Limits:
 *  - Login / Register endpoints : 5 requests per minute
 *  - All other routes            : 60 requests per minute
 *
 * NOTE: For production with multiple gateway replicas, replace the in-memory
 * map with a Redis-backed counter (e.g. `ioredis` + a sliding window script).
 */
@Injectable()
export class RateLimiterMiddleware implements NestMiddleware {
  private readonly store = new Map<string, { count: number; resetAt: number }>();

  /** Default window: 60 000 ms (1 minute) */
  private readonly WINDOW_MS = 60_000;
  /** Auth-specific limit (login / register) */
  private readonly AUTH_LIMIT = 50;
  /** Global limit */
  private readonly GLOBAL_LIMIT = 60;

  constructor(private readonly configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const ip = (req.ip ?? req.socket?.remoteAddress ?? 'unknown').replace(
      '::ffff:',
      '',
    );
    const limit = this.resolveLimit(req.path, req.method);
    const now = Date.now();

    let entry = this.store.get(ip);
    if (!entry || now >= entry.resetAt) {
      entry = { count: 0, resetAt: now + this.WINDOW_MS };
    }

    entry.count += 1;
    this.store.set(ip, entry);

    // Standard rate-limit response headers
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - entry.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetAt / 1000));

    if (entry.count > limit) {
      res.status(429).json({
        statusCode: 429,
        message: 'Too many requests — please try again later.',
        error: 'Too Many Requests',
      });
      return;
    }

    next();
  }

  private resolveLimit(path: string, method: string): number {
    if (
      method.toUpperCase() === 'POST' &&
      (path === '/api/auth/login' || path === '/api/auth/register')
    ) {
      return this.AUTH_LIMIT;
    }
    return this.GLOBAL_LIMIT;
  }
}
