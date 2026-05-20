import { Module } from "@nestjs/common";
import { MoodService } from "./mood.service";
import { MoodController } from "./mood.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { MentalHealthOrchestratorModule } from "../mental-health-orchestrator/mental-health-orchestrator.module";

@Module({
  imports: [PrismaModule, MentalHealthOrchestratorModule],
  controllers: [MoodController],
  providers: [MoodService],
  exports: [MoodService],
})
export class MoodModule {}
