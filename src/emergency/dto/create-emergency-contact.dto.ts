import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class CreateEmergencyContactDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsOptional()
  relation?: string;
}
