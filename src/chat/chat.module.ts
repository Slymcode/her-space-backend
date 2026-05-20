import { Module } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { ChatController } from "./chat.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { MentalHealthOrchestratorModule } from "../mental-health-orchestrator/mental-health-orchestrator.module";

@Module({
  imports: [PrismaModule, MentalHealthOrchestratorModule],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
