import { IsNotEmpty, IsString } from 'class-validator';

export class ProviderAuthDto {
  @IsNotEmpty()
  @IsString()
  username!: string;

  @IsNotEmpty()
  @IsString()
  password!: string;
}
