import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Request } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { MoodLogService } from "./mood-log.service";
import { CreateMoodLogDto } from "./dto/create-mood-log.dto";
import { UpdateMoodLogDto } from "./dto/update-mood-log.dto";

@Controller("mood/logs")
@UseGuards(JwtAuthGuard)
export class MoodLogController {
  constructor(private readonly moodLogService: MoodLogService) {}

  @Post()
  async createMoodLog(
    @Req() req: Request & { user: { id: string } },
    @Body() dto: CreateMoodLogDto,
  ) {
    return this.moodLogService.createMoodLog(req.user.id, dto);
  }

  @Get()
  async getMoodLogs(
    @Req() req: Request & { user: { id: string } },
    @Query("limit") limit: string = "50",
  ) {
    return this.moodLogService.getMoodLogs(req.user.id, parseInt(limit));
  }

  @Get(":id")
  async getMoodLog(
    @Req() req: Request & { user: { id: string } },
    @Param("id") id: string,
  ) {
    return this.moodLogService.getMoodLog(req.user.id, id);
  }

  @Patch(":id")
  async updateMoodLog(
    @Req() req: Request & { user: { id: string } },
    @Param("id") id: string,
    @Body() dto: UpdateMoodLogDto,
  ) {
    return this.moodLogService.updateMoodLog(req.user.id, id, dto);
  }

  @Delete(":id")
  async deleteMoodLog(
    @Req() req: Request & { user: { id: string } },
    @Param("id") id: string,
  ) {
    return this.moodLogService.deleteMoodLog(req.user.id, id);
  }
}
