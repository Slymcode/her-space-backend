import { Injectable } from "@nestjs/common";
import { AiService } from "../ai/ai.service";
import { ConversationMemoryService } from "../ai/conversation-memory.service";
import { CrisisDetectionService } from "../crisis-detection/crisis-detection.service";
import { RecommendationsService } from "../recommendations/recommendations.service";
import {
  RuleAnalysis,
  RuleEngineService,
} from "../rule-engine/rule-engine.service";

export interface OrchestrationResult {
  analysis: RuleAnalysis;
  recommendations: string[];
  aiResponse: string;
  isCrisis: boolean;
}

@Injectable()
export class MentalHealthOrchestratorService {
  constructor(
    private readonly aiService: AiService,
    private readonly conversationMemory: ConversationMemoryService,
    private readonly ruleEngine: RuleEngineService,
    private readonly recommendations: RecommendationsService,
    private readonly crisisDetection: CrisisDetectionService,
  ) {}

  async orchestrateMoodEntry(
    userId: string,
    profileName: string | undefined,
    mood: string,
    score: number,
    note?: string | null,
  ): Promise<OrchestrationResult> {
    const analysis = this.ruleEngine.analyzeMood(
      mood,
      score,
      note ?? undefined,
    );
    const recommendations =
      this.recommendations.generateRecommendations(analysis);
    const crisis = await this.crisisDetection.detectAndRecord(
      userId,
      "Mood entry",
      analysis,
      note ?? undefined,
    );
    const aiOutput = await this.aiService.generateMoodInsight(
      profileName,
      analysis,
      mood,
      score,
      note,
    );

    return {
      analysis,
      recommendations,
      aiResponse: aiOutput.response,
      isCrisis: crisis.isCrisis,
    };
  }

  async orchestrateJournalEntry(
    userId: string,
    profileName: string | undefined,
    title: string | null | undefined,
    content: string,
  ): Promise<OrchestrationResult> {
    const analysis = this.ruleEngine.analyzeJournalEntry(title, content);
    const recommendations =
      this.recommendations.generateRecommendations(analysis);
    const crisis = await this.crisisDetection.detectAndRecord(
      userId,
      "Journal entry",
      analysis,
      content,
    );
    const aiOutput = await this.aiService.generateJournalInsight(
      profileName,
      analysis,
      title,
      content,
    );

    return {
      analysis,
      recommendations,
      aiResponse: aiOutput.response,
      isCrisis: crisis.isCrisis,
    };
  }

  async orchestrateChatMessage(
    userId: string,
    profileName: string | undefined,
    message: string,
    recentConversation: string,
  ): Promise<OrchestrationResult> {
    const analysis = this.ruleEngine.analyzeChatMessage(message);
    const recommendations =
      this.recommendations.generateRecommendations(analysis);
    const crisis = await this.crisisDetection.detectAndRecord(
      userId,
      "Chat message",
      analysis,
      message,
    );
    const memory = await this.conversationMemory.buildChatMemory(userId);

    if (analysis.isCrisis && analysis.safeOverrideResponse) {
      return {
        analysis,
        recommendations,
        aiResponse: analysis.safeOverrideResponse,
        isCrisis: crisis.isCrisis,
      };
    }

    const aiOutput = await this.aiService.generateChatReply(
      profileName,
      analysis,
      message,
      recentConversation,
      memory,
    );

    return {
      analysis,
      recommendations,
      aiResponse: aiOutput.response,
      isCrisis: crisis.isCrisis,
    };
  }
}
