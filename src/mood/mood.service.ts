import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateMoodEntryDto } from "./dto/create-mood-entry.dto";
import { MentalHealthOrchestratorService } from "../mental-health-orchestrator/mental-health-orchestrator.service";

@Injectable()
export class MoodService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orchestrator: MentalHealthOrchestratorService,
  ) {}

  async createMoodEntry(
    userId: string,
    createMoodEntryDto: CreateMoodEntryDto,
  ) {
    const entry = await this.prisma.moodEntry.create({
      data: {
        userId,
        mood: createMoodEntryDto.mood,
        intensity: createMoodEntryDto.score,
        notes: createMoodEntryDto.note,
        triggers: createMoodEntryDto.triggers ?? [],
        activities: createMoodEntryDto.activities ?? [],
      },
    });

    // Run orchestration (rule engine + AI + recommendations + crisis detection)
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
    const profileName = user?.profile
      ? [(user.profile as any).firstName, (user.profile as any).lastName]
          .filter(Boolean)
          .join(" ") || undefined
      : undefined;
    const age = user?.profile?.age ?? null;

    let orchestration = null as any;
    try {
      orchestration = await this.orchestrator.orchestrateMoodEntry(
        userId,
        profileName,
        createMoodEntryDto.mood,
        createMoodEntryDto.score,
        createMoodEntryDto.note,
        age,
        user?.profile?.country ?? null,
      );
    } catch (err) {
      // Orchestration failures should not block saving the mood entry
    }

    return {
      entry: this.formatMoodEntry(entry),
      orchestration,
    };
  }

  async getMoodEntries(userId: string, limit: number = 30) {
    const entries = await this.prisma.moodEntry.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return entries.map((entry) => this.formatMoodEntry(entry));
  }

  async getMoodEntry(userId: string, entryId: string) {
    const entry = await this.prisma.moodEntry.findFirst({
      where: {
        id: entryId,
        userId,
      },
    });

    return entry ? this.formatMoodEntry(entry) : null;
  }

  async updateMoodEntry(
    userId: string,
    entryId: string,
    updateData: Partial<CreateMoodEntryDto>,
  ) {
    const data: Record<string, unknown> = {};
    if (typeof updateData.mood !== "undefined") {
      data.mood = updateData.mood;
    }
    if (typeof updateData.score !== "undefined") {
      data.intensity = updateData.score;
    }
    if (typeof updateData.note !== "undefined") {
      data.notes = updateData.note;
    }
    if (typeof updateData.triggers !== "undefined") {
      data.triggers = updateData.triggers;
    }
    if (typeof updateData.activities !== "undefined") {
      data.activities = updateData.activities;
    }

    const result = await this.prisma.moodEntry.updateMany({
      where: {
        id: entryId,
        userId,
      },
      data,
    });

    if (result.count === 0) {
      return null;
    }

    return this.getMoodEntry(userId, entryId);
  }

  async deleteMoodEntry(userId: string, entryId: string) {
    return this.prisma.moodEntry.deleteMany({
      where: {
        id: entryId,
        userId,
      },
    });
  }

  async getMoodStats(userId: string, days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const entries = await this.prisma.moodEntry.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return {
      totalEntries: entries.length,
      averageIntensity:
        entries.length > 0
          ? entries.reduce((sum, e) => sum + e.intensity, 0) / entries.length
          : 0,
      moodCounts: this.countMoods(entries),
      entries: entries.map((entry) => this.formatMoodEntry(entry)),
    };
  }

  private formatMoodEntry(entry: any) {
    const { intensity, notes, ...rest } = entry;
    return {
      ...rest,
      score: intensity,
      note: notes ?? null,
    };
  }

  private countMoods(entries: any[]) {
    const counts: Record<string, number> = {};
    entries.forEach((entry) => {
      counts[entry.mood] = (counts[entry.mood] || 0) + 1;
    });
    return counts;
  }
}
