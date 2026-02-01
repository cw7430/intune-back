import { Controller, Post, Body } from '@nestjs/common';
import { ApiBody, ApiOkResponse } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import {
  SuccessResponseDto,
  SuccessWithResultResponseDto,
} from '@/common/api/response';
import { NativeSignInRequestDto } from './dto/request';
import { SignInResponseDto } from './dto/response';

@Controller('/api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/sign-in/native')
  @ApiBody({ type: NativeSignInRequestDto })
  @ApiOkResponse({
    type: SuccessWithResultResponseDto<SignInResponseDto>,
  })
  async nativeSignIn(@Body() request: NativeSignInRequestDto) {
    return SuccessResponseDto.okWith(
      await this.authService.nativeSignIn(request),
    );
  }
}
