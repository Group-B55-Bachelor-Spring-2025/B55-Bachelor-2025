import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateAddressDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  address!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  city!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  zipCode!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  country!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  regionCode!: string;
}
