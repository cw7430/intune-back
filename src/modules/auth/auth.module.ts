import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { JwtProvider } from './jwt/jwt.provider';
import { JwtUtil } from './jwt/jwt.util';
import { AuthGuard } from './guard/auth.guard';
import { RoleGuard } from './guard/role.guard';
import { UserSharedModule } from '@/modules/shared/user.shared.module';
import { AuthService } from './auth.service';
import { AuthUtil } from './auth.util';
import { AuthController } from './auth.controller';

@Global()
@Module({
  imports: [JwtModule.register({}), UserSharedModule],
  providers: [
    JwtProvider,
    JwtUtil,
    AuthGuard,
    RoleGuard,
    AuthService,
    AuthUtil,
  ],
  controllers: [AuthController],
  exports: [JwtUtil, AuthGuard, RoleGuard],
})
export class AuthModule {}
