import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SignInResponseDto {
  @ApiProperty({ type: String })
  @Expose()
  accessToken: string;

  @ApiProperty({ type: String })
  @Expose()
  refreshToken: string;

  @ApiProperty({ type: Number })
  @Expose()
  accessTokenExpiresAtMs: number;

  @ApiProperty({ type: Number })
  @Expose()
  refreshTokenExpiresAtMs: number;

  @ApiProperty({ type: String })
  @Expose()
  nickName: string | null;

  @ApiProperty({ type: String })
  @Expose()
  gender: 'MALE' | 'FEMALE' | null;

  @ApiProperty({ type: String })
  @Expose()
  authRole: 'USER' | 'ADMIN';

  @ApiProperty({ type: String })
  @Expose()
  authType: 'NATIVE' | 'SOCIAL';
}
