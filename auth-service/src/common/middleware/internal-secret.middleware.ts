import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Internal Secret Middleware (Auth Service)
 *
 * Identical in purpose to the monolith's version — rejects any request that
 * doesn't carry the correct X-Internal-Secret header.
 * This ensures only the API Gateway can talk to the auth service directly.
 */
@Injectable()
export class InternalSecretMiddleware implements NestMiddleware {
  private readonly secret: string;

  constructor() {
    this.secret = process.env.INTERNAL_SECRET ?? '';
    if (!this.secret) {
      console.warn(
        '[AuthService][InternalSecretMiddleware] INTERNAL_SECRET is not set!',
      );
    }
  }

  use(req: Request, _res: Response, next: NextFunction): void {
    // Health checks and root probes must always bypass internal secret verification
    if (req.path === '/health' || req.path === '/') {
      return next();
    }

    const clean = (val: any) =>
      String(Array.isArray(val) ? val[0] : val || '')
        .trim()
        .replace(/^["']|["']$/g, '');

    const incomingSecret = clean(req.headers['x-internal-secret']);
    const expectedSecret = clean(process.env.INTERNAL_SECRET || this.secret);

    if (!incomingSecret || incomingSecret !== expectedSecret) {
      console.warn(
        `[AuthService][InternalSecret] 403 Forbidden on ${req.method} ${req.path}! Incoming secret present: ${!!incomingSecret} (len: ${incomingSecret.length}), Expected configured: ${!!expectedSecret} (len: ${expectedSecret.length})`,
      );
      throw new ForbiddenException(
        'Direct access to this service is not allowed. Use the API Gateway.',
      );
    }

    next();
  }
}
