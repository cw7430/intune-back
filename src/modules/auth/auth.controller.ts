import { Controller, Post, Patch, Body, Req, UseGuards } from '@nestjs/common';
import { type FastifyRequest } from 'fastify';
import { ApiTags, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { SuccessResponseDto } from '@/common/api/response';
import {
  CheckEmailRequestDto,
  NativeSignInRequestDto,
  NativeSignUpRequestDto,
  RefreshRequestDto,
  SignOutRequestDto,
} from './dto/request';
import { MeResponseDto, SignInResponseDto } from './dto/response';
import { ApiSuccessResponse, CurrentUser } from '@/common/decorator';
import { AuthGuard } from './guard/auth.guard';

@Controller('/api/v1/auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/sign-in/native')
  @ApiBody({ type: NativeSignInRequestDto })
  @ApiSuccessResponse(SignInResponseDto)
  async nativeSignIn(@Body() requestDto: NativeSignInRequestDto) {
    return SuccessResponseDto.okWith(
      await this.authService.nativeSignIn(requestDto),
    );
  }

  @Patch('/refresh')
  @ApiBearerAuth('refreshToken')
  @ApiBody({ type: RefreshRequestDto })
  @ApiSuccessResponse(SignInResponseDto)
  async refreshToken(
    @Req() request: FastifyRequest,
    @Body() requestDto: RefreshRequestDto,
  ) {
    return SuccessResponseDto.okWith(
      await this.authService.refreshToken(request, requestDto),
    );
  }

  @Post('/sign-out')
  @ApiBody({ type: SignOutRequestDto })
  @ApiSuccessResponse()
  async signOut(@Body() requestDto: SignOutRequestDto) {
    await this.authService.signOut(requestDto);
    return SuccessResponseDto.ok();
  }

  @Post('/check-email')
  @ApiBody({ type: CheckEmailRequestDto })
  @ApiSuccessResponse()
  async checkEmail(@Body() requestDto: CheckEmailRequestDto) {
    await this.authService.checkEmail(requestDto);
    return SuccessResponseDto.ok();
  }

  @Post('/sign-up/native')
  @ApiBody({ type: NativeSignUpRequestDto })
  @ApiSuccessResponse(SignInResponseDto)
  async nativeSignUp(@Body() requestDto: NativeSignUpRequestDto) {
    return SuccessResponseDto.okWith(
      await this.authService.nativeSignUp(requestDto),
    );
  }

  @Post('/me')
  @UseGuards(AuthGuard)
  @ApiSuccessResponse(MeResponseDto)
  @ApiBearerAuth('accessToken')
  parseMe(@CurrentUser('userId') userId: bigint) {
    return SuccessResponseDto.okWith(this.authService.parseMe(userId));
  }
}
