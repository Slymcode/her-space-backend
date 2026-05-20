import { Module } from "@nestjs/common";
import { AiModule } from "../ai/ai.module";
import { RuleEngineModule } from "../rule-engine/rule-engine.module";
import { RecommendationsModule } from "../recommendations/recommendations.module";
import { CrisisDetectionModule } from "../crisis-detection/crisis-detection.module";
import { MentalHealthOrchestratorService } from "./mental-health-orchestrator.service";

@Module({
  imports: [
    AiModule,
    RuleEngineModule,
    RecommendationsModule,
    CrisisDetectionModule,
  ],
  providers: [MentalHealthOrchestratorService],
  exports: [MentalHealthOrchestratorService],
})
export class MentalHealthOrchestratorModule {}
