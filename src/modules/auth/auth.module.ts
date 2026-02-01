import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { JwtProvider } from './jwt/jwt.provider';
import { JwtUtil } from './jwt/jwt.util';
import { AuthGuard } from './guard/auth.guard';
import { RoleGuard } from './guard/role.guard';
import { UserModule } from '@/modules/user/user.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [JwtModule.register({}), UserModule],
  providers: [JwtProvider, JwtUtil, AuthGuard, RoleGuard, AuthService],
  controllers: [AuthController],
  exports: [AuthGuard, RoleGuard],
})
export class AuthModule {}
