import { Module } from "@nestjs/common";
import { MoodLogService } from "./mood-log.service";
import { MoodLogController } from "./mood-log.controller";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [MoodLogController],
  providers: [MoodLogService],
  exports: [MoodLogService],
})
export class MoodLogModule {}
