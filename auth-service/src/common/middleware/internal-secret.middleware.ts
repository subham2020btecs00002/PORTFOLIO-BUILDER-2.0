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
    const incomingSecret = req.headers['x-internal-secret'];

    if (!incomingSecret || incomingSecret !== this.secret) {
      throw new ForbiddenException(
        'Direct access to this service is not allowed. Use the API Gateway.',
      );
    }

    next();
  }
}
