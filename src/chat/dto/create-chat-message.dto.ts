import { IsString, IsNotEmpty, IsEnum, IsOptional } from "class-validator";

export enum ChatRole {
  USER = "USER",
  ASSISTANT = "ASSISTANT",
}

export enum ChatType {
  SUPPORT = "SUPPORT",
  EMERGENCY = "EMERGENCY",
  GENERAL = "GENERAL",
}

export class CreateChatMessageDto {
  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsEnum(ChatRole)
  role!: ChatRole;

  @IsOptional()
  @IsEnum(ChatType)
  type?: ChatType;
}
