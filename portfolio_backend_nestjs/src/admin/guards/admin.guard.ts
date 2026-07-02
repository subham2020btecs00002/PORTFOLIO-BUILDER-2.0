import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    
    // Safety check: verify request passed through API gateway
    const internalSecret = request.headers['x-internal-secret'];
    if (!internalSecret) {
      throw new UnauthorizedException('Access denied: direct microservice access is blocked');
    }

    const userRole = request.headers['x-user-role'];
    if (userRole !== 'admin') {
      throw new ForbiddenException('Access denied: administrator privileges required');
    }

    return true;
  }
}
