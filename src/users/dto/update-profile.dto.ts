import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  firstName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  lastName?: string;

  @IsOptional()
  @IsInt()
  @Min(10)
  @Max(120)
  age?: number;

  @IsOptional()
  @IsString()
  pronouns?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  @IsIn(["en", "sw", "fr", "ha", "yo"])
  preferredLanguage?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  emotionalGoals?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  stressTriggers?: string[];

  @IsOptional()
  @IsBoolean()
  onboarded?: boolean;
}
