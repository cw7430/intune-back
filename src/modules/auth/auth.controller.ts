import { Controller, Post, Body } from '@nestjs/common';
import { type FastifyRequest } from 'fastify';
import { ApiBody, ApiOkResponse } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import {
  SuccessResponseDto,
  SuccessWithResultResponseDto,
} from '@/common/api/response';
import { NativeSignInRequestDto, RefreshRequestDto } from './dto/request';
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

  @Post('/refresh')
  async refreshToken(
    request: FastifyRequest,
    @Body() requestDto: RefreshRequestDto,
  ) {
    return SuccessResponseDto.okWith(
      await this.authService.refreshToken(request, requestDto),
    );
  }

  @Post('/sign-out')
  async signOut(request: FastifyRequest) {
    await this.authService.signOut(request);
    return SuccessResponseDto.ok();
  }
}
