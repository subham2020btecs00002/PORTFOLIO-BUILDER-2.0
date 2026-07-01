import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import { PUBLIC_ROUTES, PUBLIC_PREFIXES } from '../config/routes.config';

/**
 * JWT Verification Middleware — the core of the API Gateway's security.
 *
 * Flow for every incoming request:
 *  1. Check if the route is public → skip JWT verification, pass through.
 *  2. Extract the access token (httpOnly cookie → Authorization header fallback).
 *  3. Verify the token using the same JWT_SECRET as the auth service.
 *  4. If valid → inject `X-User-Id` header so downstream services know who the user is.
 *  5. If invalid / missing → return 401 Unauthorized immediately.
 *
 * Downstream services (monolith + auth-service) trust the `X-User-Id` header
 * because they accept requests only from this gateway (X-Internal-Secret check).
 */
@Injectable()
export class JwtVerifyMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  use(req: Request, _res: Response, next: NextFunction): void {
    if (this.isPublicRoute(req)) {
      return next();
    }

    const token = this.extractToken(req);
    if (!token) {
      throw new UnauthorizedException('Authentication token is required');
    }

    try {
      const payload = this.jwtService.verify<{ sub: string }>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      if (!payload?.sub) {
        throw new UnauthorizedException('Token payload is invalid');
      }

      // Inject user identity for downstream services
      req.headers['x-user-id'] = payload.sub;
    } catch (err: any) {
      if (err instanceof UnauthorizedException) throw err;
      // JsonWebTokenError, TokenExpiredError, etc.
      throw new UnauthorizedException(
        err?.message ?? 'Invalid or expired token',
      );
    }

    next();
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private isPublicRoute(req: Request): boolean {
    const path = req.path;
    const method = req.method.toUpperCase();

    // Exact route match
    const exactMatch = PUBLIC_ROUTES.some(
      (r) => r.path === path && r.method === method,
    );
    if (exactMatch) return true;

    // Prefix match (e.g. /api/portfolio/public/*)
    return PUBLIC_PREFIXES.some((prefix) => path.startsWith(prefix));
  }

  private extractToken(req: Request): string | null {
    // Prefer httpOnly cookie (more secure)
    if (req.cookies?.['access_token']) {
      return req.cookies['access_token'] as string;
    }

    // Fall back to Authorization: Bearer <token>
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }

    return null;
  }
}
