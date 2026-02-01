import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import { TransformNumberToString } from '@/common/decorator';

export class SignInResponseDto {
  @ApiProperty({ type: String })
  @Expose()
  accessToken: string;

  @ApiProperty({ type: String })
  @Expose()
  refreshToken: string;

  @ApiProperty({ type: String })
  @Expose()
  @TransformNumberToString()
  accessTokenExpiryMs: string;

  @ApiProperty({ type: String })
  @Expose()
  @TransformNumberToString()
  refreshTokenExpiryMs: string;

  @ApiProperty({ type: String })
  @Expose()
  nickName: string | null;

  @ApiProperty({ type: String })
  @Expose()
  gender: 'MALE' | 'FEMALE' | null;

  @ApiProperty({ type: String })
  @Expose()
  authRole: 'USER' | 'ADMIN';
}
