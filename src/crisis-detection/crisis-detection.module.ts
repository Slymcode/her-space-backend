import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { CrisisDetectionService } from "./crisis-detection.service";

@Module({
  imports: [PrismaModule],
  providers: [CrisisDetectionService],
  exports: [CrisisDetectionService],
})
export class CrisisDetectionModule {}
