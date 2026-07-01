import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * Extracts the current user identity from the X-User-Id header.
 * This header is set by the API Gateway after JWT verification —
 * the monolith no longer performs JWT verification itself.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const userId = request.headers['x-user-id'] as string;
    return { id: userId };
  },
);
