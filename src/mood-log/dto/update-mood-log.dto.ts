import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from "class-validator";

export class UpdateMoodLogDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  mood?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  score?: number;

  @IsOptional()
  @IsString()
  note?: string;
}
