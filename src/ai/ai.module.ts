import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "../prisma/prisma.module";
import { AiService } from "./ai.service";
import { ConversationMemoryService } from "./conversation-memory.service";
import { PromptBuilderService } from "./prompt-builder.service";

@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [AiService, ConversationMemoryService, PromptBuilderService],
  exports: [AiService, ConversationMemoryService],
})
export class AiModule {}
