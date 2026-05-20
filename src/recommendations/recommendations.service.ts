import { Injectable } from "@nestjs/common";
import { RuleAnalysis } from "../rule-engine/rule-engine.service";

const RECOMMENDATIONS: Record<string, string[]> = {
  happy: [
    "Celebrate what is going well today.",
    "Share your joy with a trusted friend or family member.",
    "Keep doing something kind for yourself.",
  ],
  calm: [
    "Take a few deep breaths and notice how your body feels.",
    "Keep a simple gratitude note for today.",
    "Listen to a calming song or step outside for a moment.",
  ],
  stressed: [
    "Try a short break and name three things you can control.",
    "Write down one small step to lower your pressure.",
    "Remember that rest is part of staying strong.",
  ],
  anxious: [
    "Practice a slow breathing exercise for one minute.",
    "Talk to someone who makes you feel safe.",
    "Focus on one small thing you can do right now.",
  ],
  sad: [
    "Give yourself permission to feel what you feel.",
    "Write one kind thing to yourself in your journal.",
    "Reach out to someone you trust and tell them how you are feeling.",
  ],
  lonely: [
    "Send a short message to someone you care about.",
    "Try a small self-care activity that comforts you.",
    "It is okay to ask for company or support.",
  ],
  angry: [
    "Take a moment to breathe before you act.",
    "Name what is upsetting you and let it out on paper.",
    "Move your body with a walk or gentle stretch.",
  ],
  distressed: [
    "Tell one trusted adult how you are feeling.",
    "Pause and do a gentle grounding exercise.",
    "You are not alone in this. Share your words with someone safe.",
  ],
  crisis: [
    "Please reach out to a trusted adult or helpline right now.",
    "If you feel unsafe, contact local emergency services immediately.",
    "You deserve care and support. Ask for help from someone near you.",
  ],
};

@Injectable()
export class RecommendationsService {
  generateRecommendations(analysis: RuleAnalysis) {
    const buckets =
      RECOMMENDATIONS[analysis.emotion] ?? RECOMMENDATIONS.distressed;
    return buckets.slice(0, 3);
  }
}
