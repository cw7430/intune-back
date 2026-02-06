import { Injectable, Logger } from '@nestjs/common';
import { type FastifyRequest } from 'fastify';
import { plainToInstance } from 'class-transformer';
import bcrypt from 'bcrypt';

import { UserRepository } from '@/modules/user/user.repository';
import { AuthUtil } from './auth.util';
import { NativeSignInRequestDto, RefreshRequestDto } from './dto/request';
import { SignInResponseDto } from './dto/response';
import { CustomException } from '@/common/api/exception/global.exception';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authUtil: AuthUtil,
  ) {}

  private readonly log = new Logger(AuthService.name);

  async nativeSignIn(
    requestDto: NativeSignInRequestDto,
  ): Promise<SignInResponseDto> {
    const signInResult = await this.userRepository.findNativeSignInInfoByEmail(
      requestDto.email,
    );

    if (!signInResult) {
      throw new CustomException('LOGIN_ERROR');
    }

    if (signInResult.authRole === 'LEFT') {
      throw new CustomException('LOGIN_ERROR');
    }

    if (
      !(await bcrypt.compare(requestDto.password, signInResult.passwordHash))
    ) {
      throw new CustomException('LOGIN_ERROR');
    }

    const { tokenResponse, refreshTokenExpiredAt } =
      await this.authUtil.issueTokens(
        signInResult.userId,
        signInResult.authRole,
        requestDto.isAuto,
      );

    await this.userRepository.createRefreshToken(
      signInResult.userId,
      tokenResponse.refreshToken,
      refreshTokenExpiredAt,
    );

    const response = {
      ...tokenResponse,
      nickName: signInResult.nickName,
      gender: signInResult.gender,
      authRole: signInResult.authRole,
    };

    this.log.log(`Sign In successfully for user ID: ${signInResult.userId}`);

    return plainToInstance(SignInResponseDto, response, {
      excludeExtraneousValues: true,
    });
  }

  async refreshToken(
    request: FastifyRequest,
    requestDto: RefreshRequestDto,
  ): Promise<SignInResponseDto> {
    const formalTokenInfo = await this.authUtil.getFormalRefreshInfo(request);

    const formalRefreshTokenInfo =
      await this.userRepository.findRefreshTokenIdByUserIdAndToken(
        formalTokenInfo.userId,
        formalTokenInfo.refreshToken,
      );

    if (!formalRefreshTokenInfo) {
      throw new CustomException('UNAUTHORIZED');
    }

    const refreshResult = await this.userRepository.findRefreshInfoByUserId(
      formalTokenInfo.userId,
    );

    if (!refreshResult) {
      throw new CustomException('UNAUTHORIZED');
    }

    if (refreshResult.authRole === 'LEFT') {
      throw new CustomException('LOGIN_ERROR');
    }

    const { tokenResponse, refreshTokenExpiredAt } =
      await this.authUtil.issueTokens(
        formalTokenInfo.userId,
        refreshResult.authRole,
        requestDto.isAuto,
      );

    await this.userRepository.updateRefreshToken(
      formalRefreshTokenInfo.refreshTokenId,
      tokenResponse.refreshToken,
      refreshTokenExpiredAt,
    );

    const response = {
      ...tokenResponse,
      nickName: refreshResult.nickName,
      gender: refreshResult.gender,
      authRole: refreshResult.authRole,
    };

    this.log.log(
      `Refresh Token successfully for user ID: ${formalTokenInfo.userId}`,
    );

    return plainToInstance(SignInResponseDto, response, {
      excludeExtraneousValues: true,
    });
  }

  async signOut(request: FastifyRequest): Promise<void> {
    const signOutInfo = await this.authUtil.getFormalRefreshInfo(request);
    await this.userRepository.deleteRefreshTokenByToken(
      signOutInfo.refreshToken,
    );

    this.log.log(`Sign Out successfully for user ID: ${signOutInfo.userId}`);
  }
}
