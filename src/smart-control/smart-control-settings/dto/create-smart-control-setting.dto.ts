import { IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class CreateSmartControlSettingDto {
  @IsNumber()
  deviceGroupId!: number;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean = true;

  @IsNumber()
  @IsOptional()
  temperatureOffset?: number = 0;

  @IsNumber()
  @IsOptional()
  energySavingsPercentage?: number = 10;

  @IsBoolean()
  @IsOptional()
  nightShiftEnabled?: boolean = false;

  @IsOptional()
  nightShiftStart?: Date;

  @IsNumber()
  @IsOptional()
  nightShiftDuration?: number;

  @IsNumber()
  @IsOptional()
  nightShiftSavingPercentage?: number;

  @IsNumber()
  @IsOptional()
  dayOfWeek?: number;
}
