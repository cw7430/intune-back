import { Injectable, Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import bcrypt from 'bcrypt';

import { UserRepository } from '@/modules/user/user.repository';
import { JwtProvider } from './jwt/jwt.provider';
import { JwtUtil } from './jwt/jwt.util';
import { NativeSignInRequestDto } from './dto/request';
import { SignInResponseDto } from './dto/response';
import { CustomException } from '@/common/api/exception/global.exception';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtProvider: JwtProvider,
    private readonly jwtUtil: JwtUtil,
  ) {}

  private readonly log = new Logger(AuthService.name);

  async nativeSignIn(requestDto: NativeSignInRequestDto) {
    const signInResult = await this.userRepository.findNativeSignInInfoByEmail(
      requestDto.email,
    );

    if (!signInResult) {
      throw new CustomException('LOGIN_ERROR');
    }

    if (
      !(await bcrypt.compare(requestDto.password, signInResult.passwordHash))
    ) {
      throw new CustomException('LOGIN_ERROR');
    }

    const accessToken = await this.jwtProvider.generateAccessToken(
      signInResult.userId,
      signInResult.authRole,
    );

    const accessTokenExpiryMs =
      await this.jwtUtil.extractExpirationFromAccessToken(accessToken);

    const refreshToken = await this.jwtProvider.generateRefreshToken(
      signInResult.userId,
      requestDto.isAuto,
    );

    const refreshTokenExpiryMs =
      await this.jwtUtil.extractExpirationFromRefreshToken(refreshToken);

    const refreshTokenExpiredAt = new Date(Number(refreshTokenExpiryMs));

    await this.userRepository.createRefreshToken(
      signInResult.userId,
      refreshToken,
      refreshTokenExpiredAt,
    );

    const response = {
      accessToken,
      refreshToken,
      accessTokenExpiryMs,
      refreshTokenExpiryMs,
      nickName: signInResult.nickName,
      authRole: signInResult.authRole,
    };

    this.log.log(`Sign In successfully for user ID: ${signInResult.userId}`);

    return plainToInstance(SignInResponseDto, response, {
      excludeExtraneousValues: true,
    });
  }
}
