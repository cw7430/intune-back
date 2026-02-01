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
