import { Controller, Post, Patch, Body } from '@nestjs/common';
import { type FastifyRequest } from 'fastify';
import { ApiBody, ApiOkResponse } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import {
  SuccessResponseDto,
  SuccessWithResultResponseDto,
} from '@/common/api/response';
import {
  CheckEmailRequestDto,
  NativeSignInRequestDto,
  RefreshRequestDto,
  SignOutRequestDto,
} from './dto/request';
import { SignInResponseDto } from './dto/response';

@Controller('/api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/sign-in/native')
  @ApiBody({ type: NativeSignInRequestDto })
  @ApiOkResponse({
    type: SuccessWithResultResponseDto<SignInResponseDto>,
  })
  async nativeSignIn(@Body() requestDto: NativeSignInRequestDto) {
    return SuccessResponseDto.okWith(
      await this.authService.nativeSignIn(requestDto),
    );
  }

  @Patch('/refresh')
  async refreshToken(
    request: FastifyRequest,
    @Body() requestDto: RefreshRequestDto,
  ) {
    return SuccessResponseDto.okWith(
      await this.authService.refreshToken(request, requestDto),
    );
  }

  @Post('/sign-out')
  async signOut(@Body() requestDto: SignOutRequestDto) {
    await this.authService.signOut(requestDto);
    return SuccessResponseDto.ok();
  }

  @Post('/check-email')
  async checkEmail(@Body() requestDto: CheckEmailRequestDto) {
    await this.authService.checkEmail(requestDto);
    return SuccessResponseDto.ok();
  }
}
