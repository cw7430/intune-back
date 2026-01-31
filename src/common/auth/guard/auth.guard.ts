import { Injectable, CanActivate, type ExecutionContext } from '@nestjs/common';
import { type FastifyRequest } from 'fastify';

import { JwtUtil } from '@/common/auth/jwt/jwt.util';
import { CustomException } from '@/common/api/exception/global.exception';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtUtil: JwtUtil) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();

    const token = this.jwtUtil.extractToken(request);

    await this.jwtUtil.validateAccessToken(token);

    const userId = await this.jwtUtil.extractUserIdFromAccessToken(token);
    const role = await this.jwtUtil.extractRoleFromAccessToken(token);

    if (role === 'LEFT') {
      throw new CustomException('UNAUTHORIZED');
    }

    request.user = {
      userId,
      role,
    };

    return true;
  }
}
