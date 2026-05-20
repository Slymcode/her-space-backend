import { IsOptional, IsString } from "class-validator";

export class UpdateChatSessionDto {
  @IsOptional()
  @IsString()
  title?: string;
}
