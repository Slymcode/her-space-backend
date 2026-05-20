import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Request } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ChatService } from "./chat.service";
import { CreateChatMessageDto, ChatType } from "./dto/create-chat-message.dto";
import { ChatCreateResponse } from "./dto/chat-response.dto";

@Controller("chat")
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async createChatMessage(
    @Req() req: Request & { user: { id: string } },
    @Body() createDto: CreateChatMessageDto,
  ): Promise<ChatCreateResponse> {
    return this.chatService.createChatMessage(req.user.id, createDto);
  }

  @Post("messages")
  async createChatMessageMessageAlias(
    @Req() req: Request & { user: { id: string } },
    @Body() createDto: CreateChatMessageDto,
  ): Promise<ChatCreateResponse> {
    return this.chatService.createChatMessage(req.user.id, createDto);
  }

  @Get("history")
  async getChatHistory(
    @Req() req: Request & { user: { id: string } },
    @Query("limit") limit: string = "50",
    @Query("type") type?: ChatType,
  ) {
    return this.chatService.getChatHistory(req.user.id, parseInt(limit), type);
  }

  @Get("latest")
  async getLatestMessages(
    @Req() req: Request & { user: { id: string } },
    @Query("limit") limit: string = "50",
  ) {
    return this.chatService.getLatestMessages(req.user.id, parseInt(limit));
  }

  @Get("emergency")
  async getEmergencyMessages(@Req() req: Request & { user: { id: string } }) {
    return this.chatService.getEmergencyMessages(req.user.id);
  }

  @Delete("messages/:id")
  async deleteChatMessage(
    @Req() req: Request & { user: { id: string } },
    @Param("id") messageId: string,
  ) {
    return this.chatService.deleteChatMessage(req.user.id, messageId);
  }

  @Delete("history")
  async deleteChatHistory(@Req() req: Request & { user: { id: string } }) {
    return this.chatService.deleteChatHistory(req.user.id);
  }
}
