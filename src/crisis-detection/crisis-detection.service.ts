import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RuleAnalysis } from "../rule-engine/rule-engine.service";

@Injectable()
export class CrisisDetectionService {
  constructor(private readonly prisma: PrismaService) {}

  async detectAndRecord(
    userId: string,
    source: string,
    analysis: RuleAnalysis,
    detail?: string,
  ) {
    const isCrisis =
      analysis.isCrisis ||
      analysis.severity === "high" ||
      analysis.severity === "critical";
    if (!isCrisis) {
      return { isCrisis: false };
    }

    const event = await this.prisma.crisisEvent.create({
      data: {
        userId,
        message: `${source}: ${detail ?? analysis.emotion}`,
        severity: analysis.severity,
        resolved: false,
      },
    });

    return { isCrisis: true, event };
  }
}
