import { IsString, IsNumber, MaxLength } from 'class-validator';

export class CreateDeviceGroupDto {
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsNumber()
  addressId!: number;
}
