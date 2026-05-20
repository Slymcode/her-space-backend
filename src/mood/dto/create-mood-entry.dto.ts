import {
  IsInt,
  IsOptional,
  IsString,
  Min,
  Max,
  IsArray,
} from "class-validator";

export class CreateMoodEntryDto {
  @IsString()
  mood!: string;

  @IsInt()
  @Min(1)
  @Max(10)
  score!: number;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  triggers?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  activities?: string[];
}
