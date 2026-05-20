import { Injectable } from "@nestjs/common";

export type Emotion =
  | "calm"
  | "happy"
  | "stressed"
  | "anxious"
  | "sad"
  | "lonely"
  | "angry"
  | "distressed"
  | "crisis";

export type Severity = "none" | "low" | "moderate" | "high" | "critical";
export type AgeBand = "10-13" | "14-16" | "17-19";

export interface RuleAnalysis {
  emotion: Emotion;
  severity: Severity;
  isCrisis: boolean;
  triggers: string[];
  ageBand: AgeBand;
  safeOverrideResponse?: string;
}

const CRISIS_PATTERNS: RegExp[] = [
  /\bkill (?:myself|me)\b/i,
  /\bend (?:my|it all)\b/i,
  /\bsuicid/i,
  /\bself[-\s]?harm\b/i,
  /\bcut(?:ting)? myself\b/i,
  /\bwant to die\b/i,
  /\bno reason to live\b/i,
  /\bdisappear forever\b/i,
  /\bnobody (?:cares|would care|loves me)\b/i,
  /\bgive up( on life)?\b/i,
  /\bhate my life\b/i,
  /\bbeing (?:beaten|hit|abused|raped)\b/i,
  /\b(?:he|she|they) (?:hits|beats|rapes|touches) me\b/i,
];

const EMOTION_KEYWORDS: Record<Exclude<Emotion, "crisis">, RegExp[]> = {
  happy: [/(happy|joy|excited|grateful|amazing|good day|smiling)/i],
  calm: [/(calm|peaceful|fine|okay|relaxed|alright)/i],
  stressed: [
    /(stressed|pressure|overwhelm|too much|exhausted|tired|exam|fees|school)/i,
  ],
  anxious: [/(anxious|worried|nervous|scared|afraid|panic|heart racing)/i],
  sad: [/(sad|cry(?:ing)?|tears|hurt(?:ing)?|broken|empty)/i],
  lonely: [/(lonely|alone|no friends|nobody talks|isolated|left out)/i],
  angry: [/(angry|mad|furious|hate(?! my life)|annoyed|frustrated)/i],
  distressed: [/(hopeless|worthless|useless|can't anymore|trapped|depressed)/i],
};

const CULTURAL_TRIGGERS: Record<string, RegExp> = {
  "academic-pressure":
    /\b(exam|grade|fail|school fees|teacher beat|homework|pressure)\b/i,
  "family-pressure":
    /\b(parent|mum|mom|dad|father|mother|uncle|aunt|family)\b/i,
  "body-shaming": /\b(fat|skinny|ugly|dark[-\s]?skin|hair|body)\b/i,
  bullying: /\b(bull(?:y|ied|ying)|tease|laugh at me|mock)\b/i,
  poverty: /\b(no money|hungry|can't afford|poor)\b/i,
  "gender-discrimination":
    /\b(because i'?m a girl|girls can'?t|boys are better)\b/i,
};

@Injectable()
export class RuleEngineService {
  analyzeMood(mood: string, score: number, note?: string): RuleAnalysis {
    const text = [mood, note ?? ""].join(" ");
    const analysis = this.analyzeText(text);
    const intensitySeverity: Severity =
      score <= 2 ? "moderate" : score <= 4 ? "low" : analysis.severity;

    return {
      ...analysis,
      severity: intensitySeverity,
      isCrisis:
        analysis.isCrisis ||
        intensitySeverity === "high" ||
        intensitySeverity === "critical",
    };
  }

  analyzeJournalEntry(
    title: string | null | undefined,
    content: string,
  ): RuleAnalysis {
    const text = [title ?? "", content].join(" ");
    return this.analyzeText(text);
  }

  analyzeChatMessage(message: string, age?: number | null): RuleAnalysis {
    return this.analyzeText(message, age);
  }

  private analyzeText(text: string, age?: number | null): RuleAnalysis {
    const normalized = text.trim();
    const triggers = Object.entries(CULTURAL_TRIGGERS)
      .filter(([_, re]) => re.test(normalized))
      .map(([name]) => name);

    const isCrisis = CRISIS_PATTERNS.some((re) => re.test(normalized));
    if (isCrisis) {
      return {
        emotion: "crisis",
        severity: "critical",
        isCrisis: true,
        triggers,
        ageBand: this.getAgeBand(age),
        safeOverrideResponse: this.getCrisisMessage(this.getAgeBand(age)),
      };
    }

    let best: { emotion: Emotion; hits: number } = { emotion: "calm", hits: 0 };
    for (const [emotion, patterns] of Object.entries(EMOTION_KEYWORDS) as [
      Exclude<Emotion, "crisis">,
      RegExp[],
    ][]) {
      const hits = patterns.reduce(
        (count, re) => count + (re.test(normalized) ? 1 : 0),
        0,
      );
      if (hits > best.hits) {
        best = { emotion, hits };
      }
    }

    const severity: Severity =
      best.emotion === "distressed"
        ? "high"
        : ["anxious", "sad", "lonely", "angry"].includes(best.emotion)
          ? "moderate"
          : best.emotion === "stressed"
            ? "low"
            : "none";

    return {
      emotion: best.emotion,
      severity,
      isCrisis: false,
      triggers,
      ageBand: this.getAgeBand(age),
    };
  }

  private getAgeBand(age?: number | null): AgeBand {
    if (!age) return "14-16";
    if (age <= 13) return "10-13";
    if (age <= 16) return "14-16";
    return "17-19";
  }

  private getCrisisMessage(ageBand: AgeBand): string {
    const baseMessage =
      ageBand === "10-13"
        ? "I'm really glad you told me how you feel. You matter so much. What you're feeling is heavy, and you don't have to carry it alone."
        : "Thank you for trusting me with this. What you're feeling is real and it's serious — and you deserve safe, caring support right now.";

    return `${baseMessage}

Please reach out to someone you trust today — a parent, aunt, teacher, school counselor, religious leader, or older sibling — and tell them what you told me.

If you are in immediate danger or thinking of hurting yourself, please call a helpline right now. I'm here with you.`;
  }
}
