import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PromptBuilderService } from "./prompt-builder.service";
import { RuleAnalysis } from "../rule-engine/rule-engine.service";
import { ConversationMemory } from "./conversation-memory.service";

interface AiResponse {
  response: string;
  safe: boolean;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly providerName =
    this.configService.get<string>("AI_PROVIDER")?.toLowerCase() || "groq";
  private readonly groqBaseUrl = "https://api.groq.com/openai/v1";

  constructor(
    private readonly configService: ConfigService,
    private readonly promptBuilder: PromptBuilderService,
  ) {}

  private createProviderClient(): any {
    const apiKey = this.configService.get<string>("GROQ_API_KEY");
    if (!apiKey) {
      throw new Error("GROQ_API_KEY is required for AI generation.");
    }

    let OpenAI: any;
    try {
      // Use runtime require so TypeScript does not fail if the module is missing in a deployment environment.
      // The service already falls back to a safe response when GROQ_API_KEY is missing.
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const OpenAIModule = require("openai");
      OpenAI = OpenAIModule?.default ?? OpenAIModule;
    } catch (error) {
      this.logger.error(
        "OpenAI module could not be loaded. Ensure openai is installed in the deployment environment.",
        error,
      );
      throw new Error("OpenAI provider module is unavailable.");
    }

    switch (this.providerName) {
      case "groq":
        return new OpenAI({ apiKey, baseURL: this.groqBaseUrl });
      default:
        throw new Error(`Unsupported AI_PROVIDER: ${this.providerName}`);
    }
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

  private async generateResponse(
    type: "mood" | "journal" | "chat",
    systemPrompt: string,
    userPrompt: string,
    analysis: RuleAnalysis,
  ): Promise<AiResponse> {
    const apiKey = this.configService.get<string>("GROQ_API_KEY");
    if (!apiKey) {
      this.logger.warn("Missing GROQ_API_KEY; using fallback response.");
      return {
        safe: true,
        response: this.getFallbackResponse(type, analysis, true),
      };
    }

    const client = this.createProviderClient();
    const model =
      this.configService.get<string>("GROQ_MODEL") || "llama3-70b-8192";

    const messages = [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ];

    const request = {
      model,
      messages,
      temperature: 0.7,
      top_p: 0.95,
      max_tokens: 450,
    } as any;

    const content = await this.performProviderRequest(
      client,
      request,
      systemPrompt,
      userPrompt,
    );

    if (typeof content !== "string" || !content.trim()) {
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
  }

  private async performProviderRequest(
    client: any,
    request: any,
    systemPrompt: string,
    userPrompt: string,
  ): Promise<string | null> {
    try {
      const completion = await client.chat.completions.create(request);
      return completion.choices?.[0]?.message?.content ?? null;
    } catch (firstError) {
      this.logger.warn(`Chat completion request failed: ${firstError}`);
      try {
        const response = (await client.responses.create({
          model: request.model,
          input: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: request.temperature,
          top_p: request.top_p,
          max_output_tokens: request.max_tokens,
        })) as any;

        const output = response.output?.[0] as any;
        if (!output) return null;
        if (typeof output === "string") return output;

        const content = output?.content;
        if (Array.isArray(content) && content.length) {
          const firstPiece = content[0] as any;
          if (typeof firstPiece === "string") return firstPiece;
          if (typeof firstPiece?.text === "string") return firstPiece.text;
          if (typeof firstPiece?.message?.content === "string")
            return firstPiece.message.content;
        }

        if (typeof output?.text === "string") return output.text;
        if (typeof output?.message?.content === "string")
          return output.message.content;
        return null;
      } catch (secondError) {
        this.logger.warn(`Responses API fallback failed: ${secondError}`);
        return null;
      }
    }
  }

  private getFallbackResponse(
    type: string,
    analysis: RuleAnalysis,
    isError: boolean = false,
  ) {
    if (analysis.isCrisis) {
      return `I’m sorry, I’m not able to process that safely right now. If you feel unsafe, please tell a trusted adult or call a local helpline.`;
    }

    if (isError) {
      return `I couldn't get a response from my AI assistant just now. Please try again in a moment.`;
    }

    const fallbackPhrases = [
      "That sounds really heavy, and I’m here with you.",
      "I hear how difficult this is for you.",
      "It matters that you shared this. I’m listening.",
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
      /\byou (?:have|are) (?:depressed|bipolar|schizophren)/i,
      /\b(?:take|use) (?:drugs|pills|medication)\b/i,
    ];

    for (const re of forbidden) {
      if (re.test(output)) {
        return {
          safe: false,
          replacement:
            "I want to be careful with what I share here. Your feelings matter so much. Please talk to a trusted adult — a parent, aunt, teacher, or counselor — about what's going on. I'm here to listen too.",
        };
      }
    }

    return { safe: true };
  }

  private sanitizeResponse(value: string) {
    return value.trim();
  }
}
