import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ChatRole } from "../chat/dto/create-chat-message.dto";

export interface ConversationMemory {
  summary: string;
  moodSummary: string;
  journalSummary: string;
}

@Injectable()
export class ConversationMemoryService {
  constructor(private readonly prisma: PrismaService) {}

  async buildChatMemory(userId: string): Promise<ConversationMemory> {
    const [messages, moodEntries, journalEntries] = await Promise.all([
      this.prisma.chatMessage.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      this.prisma.moodEntry.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      this.prisma.journalEntry.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    const recentMessages = messages.slice(0, 16).reverse();
    const memorySummary = this.buildMemorySummary(recentMessages);
    const moodSummary = this.buildMoodSummary(moodEntries);
    const journalSummary = this.buildJournalSummary(journalEntries);

    return {
      summary: memorySummary,
      moodSummary,
      journalSummary,
    };
  }

  private buildMemorySummary(
    messages: Array<{ role: string; content: string }>,
  ) {
    if (messages.length === 0) {
      return "No previous chat memory is available yet.";
    }

    const userMessages = messages
      .filter((message) => message.role === ChatRole.USER)
      .map((message) => message.content)
      .slice(-6);

    const assistantMessages = messages
      .filter((message) => message.role === ChatRole.ASSISTANT)
      .map((message) => message.content)
      .slice(-4);

    const themes = this.extractThemes(
      messages.map((message) => message.content),
    );
    const recentTopics = themes.length
      ? `Recent topics include ${themes.join(", ")}.`
      : "The user has shared thoughts and feelings without a clear repeated topic yet.";

    const lastUserSnippet = userMessages.length
      ? `The latest things the user shared: ${userMessages.join(" / ")}.`
      : "The user has not written many user messages yet.";

    const assistantTone = assistantMessages.length
      ? `Previous responses were gentle, reassuring and aimed at the user's emotional needs.`
      : "";

    return [recentTopics, lastUserSnippet, assistantTone]
      .filter(Boolean)
      .join(" ");
  }

  private buildMoodSummary(
    entries: Array<{ mood: string; intensity: number; notes: string | null }>,
  ) {
    if (entries.length === 0) {
      return "No mood logs are available yet.";
    }

    const moods = entries.map((entry) => entry.mood);
    const topMoods = Array.from(new Set(moods)).slice(0, 3);
    const averageIntensity = Math.round(
      entries.reduce((sum, entry) => sum + entry.intensity, 0) / entries.length,
    );
    const sampleNotes = entries
      .map((entry) => entry.notes)
      .filter(Boolean)
      .slice(0, 2);

    return `Recent mood check-ins show ${topMoods.join(", ")} with an average intensity of ${averageIntensity}. ${sampleNotes.length ? `A few notes: ${sampleNotes.join(" / ")}.` : ""}`.trim();
  }

  private buildJournalSummary(
    entries: Array<{ title: string; content: string }>,
  ) {
    if (entries.length === 0) {
      return "No journal entries are available yet.";
    }

    const titles = entries.map(
      (entry) => entry.title || entry.content.slice(0, 40),
    );
    const topicList = titles.slice(0, 3).join(", ");
    return `Recent journal topics included ${topicList}.`;
  }

  private extractThemes(texts: string[]) {
    const normalized = texts.join(" ").toLowerCase();
    const themes: string[] = [];

    const patterns: Array<{ label: string; re: RegExp }> = [
      {
        label: "school or exam pressure",
        re: /\b(exam|school|teacher|homework|assignment|grades|test|result|classwork)\b/i,
      },
      {
        label: "family or parent stress",
        re: /\b(parent|mum|mom|dad|family|aunt|uncle|home|house)\b/i,
      },
      {
        label: "friendship or loneliness",
        re: /\b(friend|bestie|alone|lonely|nobody|left out|bully|peer)\b/i,
      },
      {
        label: "self-doubt or confidence struggles",
        re: /\b(worthless|useless|confidence|self[- ]esteem|I can'?t|I don'?t belong|not good enough)\b/i,
      },
      {
        label: "future worries or dreams",
        re: /\b(future|dream|university|career|job|plan|goal|goal)\b/i,
      },
      {
        label: "stress or anxiety",
        re: /\b(stress|anxious|panic|pressure|overwhelm|tired|burnout|worry)\b/i,
      },
      {
        label: "emotional pain or sadness",
        re: /\b(sad|cry|hurt|broken|empty|hopeless|worthless)\b/i,
      },
    ];

    for (const pattern of patterns) {
      if (pattern.re.test(normalized)) {
        themes.push(pattern.label);
      }
    }

    return themes.slice(0, 4);
  }
}
