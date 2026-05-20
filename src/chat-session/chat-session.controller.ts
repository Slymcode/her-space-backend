import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Request } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ChatSessionService } from "./chat-session.service";
import { CreateChatSessionDto } from "./dto/create-chat-session.dto";
import { UpdateChatSessionDto } from "./dto/update-chat-session.dto";

@Controller("chat/sessions")
@UseGuards(JwtAuthGuard)
export class ChatSessionController {
  constructor(private readonly chatSessionService: ChatSessionService) {}

  @Post()
  async createSession(
    @Req() req: Request & { user: { id: string } },
    @Body() dto: CreateChatSessionDto,
  ) {
    return this.chatSessionService.createSession(req.user.id, dto);
  }

  @Get()
  async getSessions(
    @Req() req: Request & { user: { id: string } },
    @Query("limit") limit: string = "50",
  ) {
    return this.chatSessionService.getSessions(req.user.id, parseInt(limit));
  }

  @Get(":id")
  async getSession(
    @Req() req: Request & { user: { id: string } },
    @Param("id") id: string,
  ) {
    return this.chatSessionService.getSession(req.user.id, id);
  }

  @Patch(":id")
  async updateSession(
    @Req() req: Request & { user: { id: string } },
    @Param("id") id: string,
    @Body() dto: UpdateChatSessionDto,
  ) {
    return this.chatSessionService.updateSession(req.user.id, id, dto);
  }

  @Delete(":id")
  async deleteSession(
    @Req() req: Request & { user: { id: string } },
    @Param("id") id: string,
  ) {
    return this.chatSessionService.deleteSession(req.user.id, id);
  }
}
