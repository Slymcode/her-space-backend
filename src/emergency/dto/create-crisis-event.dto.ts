import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class CreateCrisisEventDto {
  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsString()
  @IsNotEmpty()
  severity!: string;

  @IsOptional()
  @IsString()
  resolved?: boolean;
}
