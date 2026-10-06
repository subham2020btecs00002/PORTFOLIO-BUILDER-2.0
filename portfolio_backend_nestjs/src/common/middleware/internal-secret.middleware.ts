import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Internal Secret Middleware
 *
 * Protects monolith routes from being called directly — every request must
 * carry the `X-Internal-Secret` header that only the API Gateway knows.
 * This prevents anyone from bypassing the gateway's JWT enforcement by
 * talking directly to this service on port 5000.
 */
@Injectable()
export class InternalSecretMiddleware implements NestMiddleware {
  private readonly secret: string;

  constructor() {
    this.secret = process.env.INTERNAL_SECRET ?? '';
    if (!this.secret) {
      console.warn(
        '[InternalSecretMiddleware] INTERNAL_SECRET is not set — all requests will be blocked!',
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
        `[Backend][InternalSecret] 403 Forbidden on ${req.method} ${req.path}! Incoming secret present: ${!!incomingSecret} (len: ${incomingSecret.length}), Expected configured: ${!!expectedSecret} (len: ${expectedSecret.length})`,
      );
      throw new ForbiddenException(
        'Direct access to this service is not allowed. Use the API Gateway.',
      );
    }

    next();
  }
}
