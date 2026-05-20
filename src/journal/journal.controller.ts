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
import { JournalService } from "./journal.service";
import {
  CreateJournalEntryDto,
  UpdateJournalEntryDto,
} from "./dto/create-journal-entry.dto";
import { JournalEntryResponse } from "./dto/journal-entry-response.dto";

@Controller("journal")
@UseGuards(JwtAuthGuard)
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  @Post("entries")
  async createJournalEntry(
    @Req() req: Request & { user: { id: string } },
    @Body() createDto: CreateJournalEntryDto,
  ): Promise<JournalEntryResponse> {
    return this.journalService.createJournalEntry(req.user.id, createDto);
  }

  @Get("entries")
  async getJournalEntries(
    @Req() req: Request & { user: { id: string } },
    @Query("limit") limit: string = "50",
  ) {
    return this.journalService.getJournalEntries(req.user.id, parseInt(limit));
  }

  @Get("entries/search")
  async searchJournalEntries(
    @Req() req: Request & { user: { id: string } },
    @Query("q") query: string,
  ) {
    return this.journalService.searchJournalEntries(req.user.id, query);
  }

  @Get("entries/mood/:mood")
  async getEntriesByMood(
    @Req() req: Request & { user: { id: string } },
    @Param("mood") mood: string,
  ) {
    return this.journalService.getEntriesByMood(req.user.id, mood);
  }

  @Get("entries/:id")
  async getJournalEntry(
    @Req() req: Request & { user: { id: string } },
    @Param("id") entryId: string,
  ) {
    return this.journalService.getJournalEntry(req.user.id, entryId);
  }

  @Patch("entries/:id")
  async updateJournalEntry(
    @Req() req: Request & { user: { id: string } },
    @Param("id") entryId: string,
    @Body() updateDto: UpdateJournalEntryDto,
  ) {
    return this.journalService.updateJournalEntry(
      req.user.id,
      entryId,
      updateDto,
    );
  }

  @Delete("entries/:id")
  async deleteJournalEntry(
    @Req() req: Request & { user: { id: string } },
    @Param("id") entryId: string,
  ) {
    return this.journalService.deleteJournalEntry(req.user.id, entryId);
  }
}
