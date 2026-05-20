import { Module } from "@nestjs/common";
import { JournalService } from "./journal.service";
import { JournalController } from "./journal.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { MentalHealthOrchestratorModule } from "../mental-health-orchestrator/mental-health-orchestrator.module";

@Module({
  imports: [PrismaModule, MentalHealthOrchestratorModule],
  controllers: [JournalController],
  providers: [JournalService],
  exports: [JournalService],
})
export class JournalModule {}
