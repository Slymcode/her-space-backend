import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateMoodLogDto } from "./dto/create-mood-log.dto";
import { UpdateMoodLogDto } from "./dto/update-mood-log.dto";

@Injectable()
export class MoodLogService {
  constructor(private readonly prisma: PrismaService) {}

  async createMoodLog(userId: string, dto: CreateMoodLogDto) {
    return this.prisma.moodLog.create({
      data: {
        userId,
        mood: dto.mood,
        score: dto.score,
        note: dto.note,
      },
    });
  }

  async getMoodLogs(userId: string, limit = 50) {
    return this.prisma.moodLog.findMany({
      where: { userId },
      orderBy: { loggedAt: "desc" },
      take: limit,
    });
  }

  async getMoodLog(userId: string, id: string) {
    return this.prisma.moodLog.findFirst({
      where: { id, userId },
    });
  }

  async updateMoodLog(userId: string, id: string, dto: UpdateMoodLogDto) {
    return this.prisma.moodLog.updateMany({
      where: { id, userId },
      data: {
        mood: dto.mood,
        score: dto.score,
        note: dto.note,
      },
    });
  }

  async deleteMoodLog(userId: string, id: string) {
    return this.prisma.moodLog.deleteMany({
      where: { id, userId },
    });
  }
}
