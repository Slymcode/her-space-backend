import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  CreateJournalEntryDto,
  UpdateJournalEntryDto,
} from "./dto/create-journal-entry.dto";
import { MentalHealthOrchestratorService } from "../mental-health-orchestrator/mental-health-orchestrator.service";

@Injectable()
export class JournalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orchestrator: MentalHealthOrchestratorService,
  ) {}

  async createJournalEntry(userId: string, createDto: CreateJournalEntryDto) {
    const entry = await this.prisma.journalEntry.create({
      data: {
        ...createDto,
        userId,
        isPrivate: createDto.isPrivate ?? true,
      },
    });

    // Run orchestration asynchronously; do not block the response
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
      orchestration = await this.orchestrator.orchestrateJournalEntry(
        userId,
        profileName,
        createDto.title,
        createDto.content,
        age,
        user?.profile?.country ?? null,
      );
    } catch (err) {
      // swallow
    }

    return { entry, orchestration };
  }

  async getJournalEntries(userId: string, limit: number = 50) {
    return this.prisma.journalEntry.findMany({
      where: {
        userId,
        isPrivate: true, // Only get private entries for the user
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async getJournalEntry(userId: string, entryId: string) {
    const entry = await this.prisma.journalEntry.findUnique({
      where: { id: entryId },
    });

    if (!entry) {
      throw new NotFoundException("Journal entry not found");
    }

    // Check ownership
    if (entry.userId !== userId) {
      throw new ForbiddenException(
        "You do not have permission to access this entry",
      );
    }

    return entry;
  }

  async updateJournalEntry(
    userId: string,
    entryId: string,
    updateDto: UpdateJournalEntryDto,
  ) {
    const entry = await this.prisma.journalEntry.findUnique({
      where: { id: entryId },
    });

    if (!entry) {
      throw new NotFoundException("Journal entry not found");
    }

    if (entry.userId !== userId) {
      throw new ForbiddenException(
        "You do not have permission to update this entry",
      );
    }

    return this.prisma.journalEntry.update({
      where: { id: entryId },
      data: updateDto,
    });
  }

  async deleteJournalEntry(userId: string, entryId: string) {
    const entry = await this.prisma.journalEntry.findUnique({
      where: { id: entryId },
    });

    if (!entry) {
      throw new NotFoundException("Journal entry not found");
    }

    if (entry.userId !== userId) {
      throw new ForbiddenException(
        "You do not have permission to delete this entry",
      );
    }

    return this.prisma.journalEntry.delete({
      where: { id: entryId },
    });
  }

  async searchJournalEntries(userId: string, query: string) {
    return this.prisma.journalEntry.findMany({
      where: {
        userId,
        isPrivate: true,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { content: { contains: query, mode: "insensitive" } },
          { tags: { has: query } },
        ],
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getEntriesByMood(userId: string, mood: string) {
    return this.prisma.journalEntry.findMany({
      where: {
        userId,
        mood,
        isPrivate: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }
}
