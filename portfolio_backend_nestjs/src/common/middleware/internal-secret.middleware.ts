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
    const incomingSecret = req.headers['x-internal-secret'];

    if (!incomingSecret || incomingSecret !== this.secret) {
      throw new ForbiddenException(
        'Direct access to this service is not allowed. Use the API Gateway.',
      );
    }

    next();
  }
}
