import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class NativeSignInRequestDto {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  password: string;

  @IsOptional()
  isAuto: boolean = false;
}

export class RefreshRequestDto {
  @IsOptional()
  isAuto: boolean = false;
}

export class SignOutRequestDto {
  @IsOptional()
  refreshToken: string | null;
}

export class CheckEmailRequestDto {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;
}

export class NativeSignUpRequestDto {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  password: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nickName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  gender: 'MALE' | 'FEMALE';
}
