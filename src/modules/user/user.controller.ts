import { Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import { UserService } from './user.service';
import { SuccessResponseDto } from '@/common/api/response';
import { ApiSuccessResponse, CurrentUser } from '@/common/decorator';
import { AuthGuard } from '@/modules/auth/guard/auth.guard';

@Controller('/api/v1/user')
@ApiTags('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Patch('/user-status/online')
  @ApiBearerAuth('accessToken')
  @ApiSuccessResponse()
  async updateUserOnline(@CurrentUser('userId') userId: bigint) {
    await this.userService.updateUserOnline(userId);
    return SuccessResponseDto.ok();
  }

  @Patch('/user-status/offline/:userId')
  @ApiSuccessResponse()
  async updateUserOffline(@Param('userId') userId: bigint) {
    await this.userService.updateUserOffline(userId);
    return SuccessResponseDto.ok();
  }
}
