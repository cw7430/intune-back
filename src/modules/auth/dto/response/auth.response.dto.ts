import { Expose } from 'class-transformer';

import { TransformBigintToString } from '@/common/decorator';

export class SignInResponseDto {
  @Expose()
  accessToken: string;

  @Expose()
  refreshToken: string;

  @Expose()
  @TransformBigintToString()
  accessTokenExpiryMs: string;

  @Expose()
  @TransformBigintToString()
  refreshTokenExpiryMs: string;

  @Expose()
  nickName: string;

  @Expose()
  authRole: 'USER' | 'ADMIN' | 'LEFT';
}
