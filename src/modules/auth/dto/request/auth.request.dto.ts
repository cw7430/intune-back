import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  Matches,
  IsIn,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class NativeSignInRequestDto {
  @IsEmail({}, { message: '이메일 또는 비밀번호가 올바르지 않습니다.' })
  @IsNotEmpty({
    message: '이메일을 입력하여주세요.',
  })
  @MaxLength(255, { message: '255자를 초과할 수 없습니다.' })
  @ApiProperty({ description: '사용자 이메일', example: 'user@example.com' })
  email: string;

  @IsString({
    message: '이메일 또는 비밀번호가 올바르지 않습니다.',
  })
  @IsNotEmpty({
    message: '비밀번호를 입력하여주세요.',
  })
  @MaxLength(255, { message: '255자를 초과할 수 없습니다.' })
  @ApiProperty({ description: '사용자 비밀번호', example: 'password123' })
  password: string;

  @IsOptional()
  @ApiProperty({ description: '자동로그인 여부' })
  isAuto: boolean = false;
}

export class RefreshRequestDto {
  @IsOptional()
  @ApiProperty({ description: '자동로그인 여부' })
  isAuto: boolean = false;
}

export class SignOutRequestDto {
  @IsOptional()
  @ApiProperty({ description: '재발급 토큰' })
  refreshToken: string | null;
}

export class CheckEmailRequestDto {
  @IsEmail({}, { message: '이메일 형식이 올바르지 않습니다.' })
  @IsNotEmpty({
    message: '이메일을 입력하여주세요.',
  })
  @MaxLength(255, { message: '255자를 초과할 수 없습니다.' })
  @ApiProperty({ description: '사용자 이메일', example: 'user@example.com' })
  email: string;
}

export class NativeSignUpRequestDto {
  @IsEmail({}, { message: '이메일 형식이 올바르지 않습니다.' })
  @IsNotEmpty({
    message: '이메일을 입력하여주세요.',
  })
  @MaxLength(255, { message: '255자를 초과할 수 없습니다.' })
  @ApiProperty({ description: '사용자 이메일', example: 'user@example.com' })
  email: string;

  @IsNotEmpty({
    message: '비밀번호를 입력하여주세요.',
  })
  @Matches(
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}|:;"'<>,.?/~`]).{10,25}$/,
    {
      message: '비밀번호는 영문, 숫자, 특수문자를 포함하여 10~25자여야 합니다.',
    },
  )
  @ApiProperty({
    description: '사용자 비밀번호(영문, 숫자, 특수문자를 포함하여 10~25자)',
    example: 'password123!',
  })
  password: string;

  @IsString({
    message: '닉네임 형식이 옳바르지 않습니다.',
  })
  @IsNotEmpty({ message: '닉네임을 입력하여 주세요' })
  @MaxLength(255, { message: '255자를 초과할 수 없습니다.' })
  @ApiProperty({ description: '사용자 닉네임', example: '닉네임' })
  nickName: string;

  @IsNotEmpty({ message: '성별을 선택하여주세요' })
  @IsIn(['MALE', 'FEMALE'], {
    message: '성별코드는 MALE 또는 FEMALE만 가능합니다.',
  })
  @ApiProperty({
    description: '성별',
    enum: ['MALE', 'FEMALE'],
    example: 'MALE',
  })
  gender: 'MALE' | 'FEMALE';
}
