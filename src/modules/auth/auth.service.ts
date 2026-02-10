import { Inject, Injectable, Logger } from '@nestjs/common';
import { type FastifyRequest } from 'fastify';
import { type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { plainToInstance } from 'class-transformer';
import bcrypt from 'bcrypt';

import { UserRepository } from '@/modules/user/user.repository';
import { AuthUtil } from './auth.util';
import {
  CheckEmailRequestDto,
  NativeSignInRequestDto,
  NativeSignUpRequestDto,
  RefreshRequestDto,
  SignOutRequestDto,
} from './dto/request';
import { SignInResponseDto } from './dto/response';
import { CustomException } from '@/common/api/exception/global.exception';
import type * as schema from '@/common/database/schemas';

@Injectable()
export class AuthService {
  constructor(
    @Inject('DRIZZLE_CONNECTION')
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly userRepository: UserRepository,
    private readonly authUtil: AuthUtil,
  ) {}

  private readonly log = new Logger(AuthService.name);

  async nativeSignIn(
    requestDto: NativeSignInRequestDto,
  ): Promise<SignInResponseDto> {
    const signInResult = await this.userRepository.findNativeSignInInfoByEmail(
      this.db,
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
      this.db,
      signInResult.userId,
      tokenResponse.refreshToken,
      refreshTokenExpiredAt,
    );

    const response = {
      ...tokenResponse,
      nickName: signInResult.nickName,
      gender: signInResult.gender,
      authRole: signInResult.authRole,
      authType: signInResult.authType,
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
        this.db,
        formalTokenInfo.userId,
        formalTokenInfo.refreshToken,
      );

    if (!formalRefreshTokenInfo) {
      throw new CustomException('UNAUTHORIZED');
    }

    const refreshResult = await this.userRepository.findRefreshInfoByUserId(
      this.db,
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
      this.db,
      formalRefreshTokenInfo.refreshTokenId,
      tokenResponse.refreshToken,
      refreshTokenExpiredAt,
    );

    const response = {
      ...tokenResponse,
      nickName: refreshResult.nickName,
      gender: refreshResult.gender,
      authRole: refreshResult.authRole,
      authType: refreshResult.authType,
    };

    this.log.log(
      `Refresh Token successfully for user ID: ${formalTokenInfo.userId}`,
    );

    return plainToInstance(SignInResponseDto, response, {
      excludeExtraneousValues: true,
    });
  }

  async signOut(requestDto: SignOutRequestDto): Promise<void> {
    if (!requestDto.refreshToken) return;

    await this.userRepository.deleteRefreshTokenByToken(
      this.db,
      requestDto.refreshToken,
    );
  }

  async checkEmail(requestDto: CheckEmailRequestDto): Promise<void> {
    const isDuplicate = await this.userRepository.existsByEmail(
      this.db,
      requestDto.email,
    );

    if (isDuplicate) {
      throw new CustomException('DUPLICATE_RESOURCE');
    }
  }

  async nativeSignUp(
    requestDto: NativeSignUpRequestDto,
  ): Promise<SignInResponseDto> {
    const isDuplicate = await this.userRepository.existsByEmail(
      this.db,
      requestDto.email,
    );

    if (isDuplicate) {
      throw new CustomException('DUPLICATE_RESOURCE');
    }

    const passwordHash = await bcrypt.hash(requestDto.password, 10);

    const insertedUser = await this.db.transaction(async (tx) => {
      const [createUser] = await this.userRepository.createUser(
        tx,
        requestDto.email,
        requestDto.nickName,
        requestDto.gender,
      );
      await this.userRepository.createNativeUser(
        tx,
        createUser.userId,
        passwordHash,
      );
      return createUser;
    });

    if (insertedUser.authRole === 'LEFT') {
      throw new CustomException('LOGIN_ERROR');
    }

    const { tokenResponse, refreshTokenExpiredAt } =
      await this.authUtil.issueTokens(
        insertedUser.userId,
        insertedUser.authRole,
        false,
      );

    await this.userRepository.createRefreshToken(
      this.db,
      insertedUser.userId,
      tokenResponse.refreshToken,
      refreshTokenExpiredAt,
    );

    const response = {
      ...tokenResponse,
      nickName: insertedUser.nickName,
      gender: insertedUser.gender,
      authRole: insertedUser.authRole,
      authType: insertedUser.authType,
    };

    this.log.log(`Sign Up successfully for user ID: ${insertedUser.userId}`);

    return plainToInstance(SignInResponseDto, response, {
      excludeExtraneousValues: true,
    });
  }
}
