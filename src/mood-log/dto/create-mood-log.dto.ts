import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

export class CreateMoodLogDto {
  @IsString()
  @IsNotEmpty()
  mood!: string;

  @IsInt()
  @Min(1)
  @Max(10)
  score!: number;

  @IsOptional()
  @IsString()
  note?: string;
}
