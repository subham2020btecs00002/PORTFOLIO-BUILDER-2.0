import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';

/**
 * Rate Limiter Middleware
 *
 * Lightweight per-IP rate limiter with in-memory sliding window.
 *
 * Enterprise Safeguards:
 *  - Skips /health, /, and OPTIONS requests (protects 5-minute cron-job.org heartbeats)
 *  - Periodically evicts stale IP records to avoid memory leaks
 *  - Supports forwarded proxy IPs from reverse proxies (Render / Cloudflare)
 */
@Injectable()
export class RateLimiterMiddleware implements NestMiddleware {
  private readonly store = new Map<string, { count: number; resetAt: number }>();

  /** Default window: 60 000 ms (1 minute) */
  private readonly WINDOW_MS = 60_000;
  /** Auth-specific limit (login / register) */
  private readonly AUTH_LIMIT = 50;
  /** Global limit */
  private readonly GLOBAL_LIMIT = 100;
  /** Max records before triggering eager cleanup */
  private readonly MAX_STORE_SIZE = 5_000;

  constructor(private readonly configService: ConfigService) {
    // Periodic garbage collection for expired entries every 2 minutes
    setInterval(() => this.cleanupExpiredEntries(), 120_000).unref();
  }

  use(req: Request, res: Response, next: NextFunction): void {
    // 1. Permanently exempt health check routes & CORS preflights
    if (
      req.path === '/health' ||
      req.path === '/' ||
      req.method.toUpperCase() === 'OPTIONS'
    ) {
      return next();
    }

    // 2. Extract client IP safely (respecting reverse proxies)
    const rawIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.ip ||
      req.socket?.remoteAddress ||
      'unknown';
    const ip = rawIp.replace('::ffff:', '');

    const limit = this.resolveLimit(req.path, req.method);
    const now = Date.now();

    // Prevent runaway map size
    if (this.store.size > this.MAX_STORE_SIZE) {
      this.cleanupExpiredEntries();
    }

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
      const correlationId = req.headers['x-correlation-id'] || '';
      res.status(429).json({
        statusCode: 429,
        message: 'Too many requests — please try again later.',
        error: 'Too Many Requests',
        correlationId,
        timestamp: new Date().toISOString(),
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

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    for (const [key, value] of this.store.entries()) {
      if (now >= value.resetAt) {
        this.store.delete(key);
      }
    }
  }
}
