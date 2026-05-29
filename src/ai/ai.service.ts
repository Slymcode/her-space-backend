import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PromptBuilderService } from "./prompt-builder.service";
import { RuleAnalysis } from "../rule-engine/rule-engine.service";
import { ConversationMemory } from "./conversation-memory.service";
import OpenAI from "openai";
// import { GoogleGenAI } from "@google/genai";

interface AiResponse {
  response: string;
  safe: boolean;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly providerName: string;
  private readonly groqBaseUrl = "https://api.groq.com/openai/v1";
  private openai?: OpenAI;
  // private gemini?: GoogleGenAI;

  constructor(
    private readonly configService: ConfigService,
    private readonly promptBuilder: PromptBuilderService,
  ) {
    this.providerName = (
      this.configService.get<string>("AI_PROVIDER") ||
      this.configService.get<string>("USEAI") ||
      "openai"
    ).toLowerCase();

    if (this.providerName === "openai") {
      const apiKey = this.configService.get<string>("OPENAI_API_KEY");
      const baseURL = this.configService.get<string>("OPENAI_BASE_URL");
      if (!apiKey) {
        this.logger.warn("OPENAI_API_KEY is missing; OpenAI provider will not be initialized.");
      } else {
        this.openai = new OpenAI({ apiKey, baseURL });
      }
    } else if (this.providerName === "groq") {
      const apiKey = this.configService.get<string>("GROQ_API_KEY");
      const baseURL =
        this.configService.get<string>("GROQ_BASE_URL") || this.groqBaseUrl;
      if (!apiKey) {
        this.logger.warn("GROQ_API_KEY is missing; Groq provider will not be initialized.");
      } else {
        this.openai = new OpenAI({ apiKey, baseURL });
      }
    }
    // else if (this.providerName === "gemini") {
    //   const apiKey = this.configService.get<string>("GEMINI_API_KEY");
    //   const baseURL = this.configService.get<string>("GEMINI_BASE_URL");
    //   const apiVersion = this.configService.get<string>("GEMINI_API_VERSION") || "v1";
    //   if (!apiKey) {
    //     this.logger.warn("GEMINI_API_KEY is missing; Gemini provider will not be initialized.");
    //   } else {
    //     this.gemini = new GoogleGenAI({ apiKey, baseURL, apiVersion });
    //   }
    // }
  }

  async generateMoodInsight(
    profileName: string | undefined,
    analysis: RuleAnalysis,
    mood: string,
    score: number,
    note?: string | null,
  ): Promise<AiResponse> {
    const systemPrompt = this.promptBuilder.buildMoodSystemPrompt(
      profileName,
      analysis,
    );
    const userPrompt = this.promptBuilder.buildMoodUserPrompt(
      mood,
      score,
      note,
      analysis,
    );
    return this.generateResponse("mood", systemPrompt, userPrompt, analysis);
  }

  async generateJournalInsight(
    profileName: string | undefined,
    analysis: RuleAnalysis,
    title: string | null | undefined,
    content: string,
  ): Promise<AiResponse> {
    const systemPrompt = this.promptBuilder.buildJournalSystemPrompt(
      profileName,
      analysis,
    );
    const userPrompt = this.promptBuilder.buildJournalUserPrompt(
      title,
      content,
      analysis,
    );
    return this.generateResponse("journal", systemPrompt, userPrompt, analysis);
  }

  async generateChatReply(
    profileName: string | undefined,
    analysis: RuleAnalysis,
    lastUserMessage: string,
    recentConversation: string,
    memory: ConversationMemory,
  ): Promise<AiResponse> {
    const systemPrompt = this.promptBuilder.buildChatSystemPrompt(
      profileName,
      analysis,
      memory,
    );
    const userPrompt = this.promptBuilder.buildChatUserPrompt(
      lastUserMessage,
      recentConversation,
      analysis,
    );
    return this.generateResponse("chat", systemPrompt, userPrompt, analysis);
  }

  private getProviderModel(): string {
    if (this.providerName === "groq") {
      return this.configService.get<string>("GROQ_MODEL") || "llama-3.1-8b-instant";
    }
    return this.configService.get<string>("OPENAI_MODEL") || "gpt-4o-mini";
  }

  private async generateResponse(
    type: "mood" | "journal" | "chat",
    systemPrompt: string,
    userPrompt: string,
    analysis: RuleAnalysis,
  ): Promise<AiResponse> {
    const provider = this.providerName;
    if (provider === "openai" || provider === "groq") {
      if (!this.openai) {
        this.logger.warn(`${provider} provider not initialized; using fallback response.`);
        return {
          safe: true,
          response: this.getFallbackResponse(type, analysis, true),
        };
      }
      try {
        const response = await this.openai.chat.completions.create({
          model: this.getProviderModel(),
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          top_p: 0.95,
          max_tokens: type === "chat" ? 280 : 450,
        });
        const content = response.choices[0]?.message?.content;
        if (!content || !content.trim()) {
          return {
            safe: true,
            response: this.getFallbackResponse(type, analysis, true),
          };
        }
        const cleaned = this.sanitizeResponse(content);
        const validated = this.validateAiOutput(cleaned);
        return {
          safe: validated.safe,
          response: validated.safe
            ? cleaned
            : (validated.replacement ??
              this.getFallbackResponse(type, analysis, true)),
        };
      } catch (error) {
        this.logger.warn(`${provider} chat completion failed: ${error}`);
        return {
          safe: true,
          response: this.getFallbackResponse(type, analysis, true),
        };
      }
    }
    this.logger.warn(`Unknown or unimplemented AI provider: ${provider}. Using fallback response.`);
    return {
      safe: true,
      response: this.getFallbackResponse(type, analysis, true),
    };
  }

  private getFallbackResponse(
    type: string,
    analysis: RuleAnalysis,
    isError: boolean = false,
  ) {
    if (analysis.isCrisis) {
      return `IΓÇÖm sorry, IΓÇÖm not able to process that safely right now. If you feel unsafe, please tell a trusted adult or call a local helpline.`;
    }

    if (isError) {
      return `I couldn't get a response from my AI assistant just now. Please try again in a moment.`;
    }

    const fallbackPhrases = [
      "That sounds really heavy, and IΓÇÖm here with you.",
      "I hear how difficult this is for you.",
      "It matters that you shared this. IΓÇÖm listening.",
    ];
    const base =
      fallbackPhrases[Math.floor(Math.random() * fallbackPhrases.length)];

    return `${base} ${this.getRecommendationSummary(type, analysis)}`;
  }

  private getRecommendationSummary(type: string, analysis: RuleAnalysis) {
    if (analysis.emotion === "happy") {
      return "Keep noticing the good parts of your day and take care of yourself.";
    }
    if (analysis.emotion === "calm") {
      return "Keep being gentle with yourself and take a quiet moment if you can.";
    }
    return "Try a small calming step like writing one thought down or talking to someone you trust.";
  }

  private validateAiOutput(output: string) {
    const forbidden = [
      /\b(kill yourself|hurt yourself|harm yourself)\b/i,
      /\bdiagnos(?:e|is|ed)\b/i,
      /\byou (?:have|are) (?:depressed|bipolar|schizophren)\b/i,
      /\b(?:take|use) (?:drugs|pills|medication)\b/i,
    ];

    for (const re of forbidden) {
      if (re.test(output)) {
        return {
          safe: false,
          replacement:
            "I want to be careful with what I share here. Your feelings matter so much. Please talk to a trusted adult ΓÇö a parent, aunt, teacher, or counselor ΓÇö about what's going on. I'm here to listen too.",
        };
      }
    }

    return { safe: true };
  }

  private sanitizeResponse(value: string) {
    let cleaned = value.trim();

    // Remove common generated explanation prefixes that are not part of the final assistant message.
    cleaned = cleaned.replace(/^(here(?:'s| is) a\s+warm, supportive response[^\n]*:\s*)/i, "");
    cleaned = cleaned.replace(/^(here(?:'s| is) a\s+supportive assistant message[^\n]*:\s*)/i, "");
    cleaned = cleaned.replace(/^(here(?:'s| is) a\s+warm, supportive response that (?:follows|feels) [^\n]*:\s*)/i, "");
    cleaned = cleaned.replace(/^(here(?:'s| is) a\s+supportive assistant message that [^\n]*:\s*)/i, "");
    cleaned = cleaned.replace(/^(here(?:'s| is) a\s+supportive response [^\n]*:\s*)/i, "");

    const quotedMatch = cleaned.match(/["“”](.+)["“”]$/s);
    if (quotedMatch && quotedMatch[1]?.trim()) {
      cleaned = quotedMatch[1].trim();
    }

    return cleaned;
  }
}
