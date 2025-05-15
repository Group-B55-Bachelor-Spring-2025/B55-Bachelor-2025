import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  MaxLength,
  IsDate,
} from 'class-validator';

export class CreateDeviceDto {
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsString()
  @MaxLength(50)
  type!: string;

  @IsNumber()
  @IsOptional()
  deviceGroupId?: number;

  @IsNumber()
  @IsOptional()
  providerCredentialsId?: number;

  @IsString()
  @IsOptional()
  settings?: string;

  @IsString()
  @MaxLength(100)
  externalRef!: string;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  status?: string;

  @IsBoolean()
  @IsOptional()
  excludeSmartCtrl?: boolean;

  @IsDate()
  @IsOptional()
  lastSync?: Date;

  @IsNumber()
  @IsOptional()
  targetTemperature?: number;

  @IsBoolean()
  @IsOptional()
  optimized?: boolean;
}
