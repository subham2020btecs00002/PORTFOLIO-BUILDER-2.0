import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * CurrentUser decorator for Auth Service routes.
 *
 * Within the auth service, some routes (logout, getUser, updateUsername)
 * are called with the JWT already verified by the gateway.
 * The gateway injects X-User-Id, but these auth-service routes also run
 * behind @UseGuards(AuthGuard('jwt')) as a secondary check (auth service
 * is the JWT issuer, so it validates its own tokens).
 *
 * We read from req.user (set by Passport) — that works because the auth
 * service also runs JwtStrategy for its own guards.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user;
  },
);
