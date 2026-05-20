import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateChatSessionDto } from "./dto/create-chat-session.dto";
import { UpdateChatSessionDto } from "./dto/update-chat-session.dto";

@Injectable()
export class ChatSessionService {
  constructor(private readonly prisma: PrismaService) {}

  async createSession(userId: string, dto: CreateChatSessionDto) {
    return this.prisma.chatSession.create({
      data: {
        userId,
        title: dto.title || "New chat",
      },
    });
  }

  async getSessions(userId: string, limit = 50) {
    return this.prisma.chatSession.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: limit,
    });
  }

  async getSession(userId: string, sessionId: string) {
    return this.prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
    });
  }

  async updateSession(
    userId: string,
    sessionId: string,
    dto: UpdateChatSessionDto,
  ) {
    const session = await this.prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
    });
    if (!session) {
      throw new BadRequestException("Chat session not found");
    }
    return this.prisma.chatSession.update({
      where: { id: sessionId },
      data: { title: dto.title ?? session.title },
    });
  }

  async deleteSession(userId: string, sessionId: string) {
    return this.prisma.chatSession.deleteMany({
      where: { id: sessionId, userId },
    });
  }
}
