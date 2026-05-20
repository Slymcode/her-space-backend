import { IsOptional, IsString, IsBoolean } from "class-validator";

export class UpdateCrisisEventDto {
  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsString()
  severity?: string;

  @IsOptional()
  @IsBoolean()
  resolved?: boolean;
}
