import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  CreateChatMessageDto,
  ChatType,
  ChatRole,
} from "./dto/create-chat-message.dto";
import { MentalHealthOrchestratorService } from "../mental-health-orchestrator/mental-health-orchestrator.service";

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orchestrator: MentalHealthOrchestratorService,
  ) {}

  async createChatMessage(userId: string, createDto: CreateChatMessageDto) {
    // Save user message first
    const userMsg = await this.prisma.chatMessage.create({
      data: {
        content: createDto.content,
        role: createDto.role,
        userId,
        type: createDto.type ?? ChatType.SUPPORT,
      },
    });

    // fetch profile name if available
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
    const profileName = user?.profile?.fullName ?? undefined;
    const age = user?.profile?.age ?? null;

    // Run orchestration to get AI reply and detect crisis
    const recentMessages = (await this.getLatestMessages(userId, 20)).reverse();
    const recent = recentMessages
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n");
    let aiResult;
    try {
      aiResult = await this.orchestrator.orchestrateChatMessage(
        userId,
        profileName,
        createDto.content,
        recent,
        age,
        user?.profile?.country ?? null,
      );
    } catch (err) {
      aiResult = null;
    }

    if (aiResult?.analysis) {
      await this.prisma.chatMessage.update({
        where: { id: userMsg.id },
        data: { emotion: aiResult.analysis.emotion },
      });
    }

    // If AI produced a response, save assistant message and return orchestration
    if (aiResult && aiResult.aiResponse) {
      const assistant = await this.prisma.chatMessage.create({
        data: {
          content: aiResult.aiResponse,
          role: ChatRole.ASSISTANT,
          userId,
          type: createDto.type ?? ChatType.SUPPORT,
          emotion: aiResult.analysis?.emotion,
          isCrisis: aiResult.isCrisis,
        },
      });
      return { message: assistant, orchestration: aiResult };
    }

    return { message: userMsg, orchestration: aiResult };
  }

  async getChatHistory(userId: string, limit: number = 50, type?: ChatType) {
    return this.prisma.chatMessage.findMany({
      where: {
        userId,
        ...(type && { type }),
      },
      orderBy: { createdAt: "asc" },
      take: limit,
      skip: 0,
    });
  }

  async getEmergencyMessages(userId: string) {
    return this.prisma.chatMessage.findMany({
      where: {
        userId,
        type: ChatType.EMERGENCY,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  }

  async getLatestMessages(userId: string, limit: number = 50) {
    return this.prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async deleteChatHistory(userId: string) {
    return this.prisma.chatMessage.deleteMany({
      where: { userId },
    });
  }

  async deleteChatMessage(userId: string, messageId: string) {
    return this.prisma.chatMessage.deleteMany({
      where: {
        id: messageId,
        userId,
      },
    });
  }
}
