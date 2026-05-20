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
import { MoodService } from "./mood.service";
import { CreateMoodEntryDto } from "./dto/create-mood-entry.dto";
import { MoodEntryResponse } from "./dto/mood-entry-response.dto";

@Controller("mood")
@UseGuards(JwtAuthGuard)
export class MoodController {
  constructor(private readonly moodService: MoodService) {}

  @Post("entries")
  async createMoodEntry(
    @Req() req: Request & { user: { id: string } },
    @Body() createMoodEntryDto: CreateMoodEntryDto,
  ): Promise<MoodEntryResponse> {
    return this.moodService.createMoodEntry(req.user.id, createMoodEntryDto);
  }

  @Get("entries")
  async getMoodEntries(
    @Req() req: Request & { user: { id: string } },
    @Query("limit") limit: string = "30",
  ) {
    return this.moodService.getMoodEntries(req.user.id, parseInt(limit));
  }

  @Get("entries/:id")
  async getMoodEntry(
    @Req() req: Request & { user: { id: string } },
    @Param("id") entryId: string,
  ) {
    return this.moodService.getMoodEntry(req.user.id, entryId);
  }

  @Patch("entries/:id")
  async updateMoodEntry(
    @Req() req: Request & { user: { id: string } },
    @Param("id") entryId: string,
    @Body() updateData: Partial<CreateMoodEntryDto>,
  ) {
    return this.moodService.updateMoodEntry(req.user.id, entryId, updateData);
  }

  @Delete("entries/:id")
  async deleteMoodEntry(
    @Req() req: Request & { user: { id: string } },
    @Param("id") entryId: string,
  ) {
    return this.moodService.deleteMoodEntry(req.user.id, entryId);
  }

  @Get("stats")
  async getMoodStats(
    @Req() req: Request & { user: { id: string } },
    @Query("days") days: string = "7",
  ) {
    return this.moodService.getMoodStats(req.user.id, parseInt(days));
  }
}
