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
import { EmergencyService } from "./emergency.service";
import { CreateEmergencyContactDto } from "./dto/create-emergency-contact.dto";
import { UpdateEmergencyContactDto } from "./dto/update-emergency-contact.dto";
import { CreateCrisisEventDto } from "./dto/create-crisis-event.dto";
import { UpdateCrisisEventDto } from "./dto/update-crisis-event.dto";

@Controller("emergency")
@UseGuards(JwtAuthGuard)
export class EmergencyController {
  constructor(private readonly svc: EmergencyService) {}

  // Contacts
  @Post("contacts")
  async createContact(
    @Req() req: Request & { user: { id: string } },
    @Body() dto: CreateEmergencyContactDto,
  ) {
    return this.svc.createContact(req.user.id, dto);
  }

  @Get("contacts")
  async listContacts(@Req() req: Request & { user: { id: string } }) {
    return this.svc.listContacts(req.user.id);
  }

  @Patch("contacts/:id")
  async updateContact(
    @Req() req: Request & { user: { id: string } },
    @Param("id") id: string,
    @Body() dto: UpdateEmergencyContactDto,
  ) {
    return this.svc.updateContact(req.user.id, id, dto);
  }

  @Delete("contacts/:id")
  async deleteContact(
    @Req() req: Request & { user: { id: string } },
    @Param("id") id: string,
  ) {
    return this.svc.deleteContact(req.user.id, id);
  }

  // Crisis events
  @Post("crisis")
  async createCrisis(
    @Req() req: Request & { user: { id: string } },
    @Body() dto: CreateCrisisEventDto,
  ) {
    return this.svc.createCrisisEvent(req.user.id, dto);
  }

  @Get("crisis")
  async listCrisis(
    @Req() req: Request & { user: { id: string } },
    @Query("limit") limit: string = "50",
  ) {
    return this.svc.listCrisisEvents(req.user.id, parseInt(limit));
  }

  @Get("crisis/:id")
  async getCrisis(
    @Req() req: Request & { user: { id: string } },
    @Param("id") id: string,
  ) {
    return this.svc.getCrisisEvent(req.user.id, id);
  }

  @Patch("crisis/:id")
  async updateCrisis(
    @Req() req: Request & { user: { id: string } },
    @Param("id") id: string,
    @Body() dto: UpdateCrisisEventDto,
  ) {
    return this.svc.updateCrisisEvent(req.user.id, id, dto);
  }

  @Delete("crisis/:id")
  async deleteCrisis(
    @Req() req: Request & { user: { id: string } },
    @Param("id") id: string,
  ) {
    return this.svc.deleteCrisisEvent(req.user.id, id);
  }
}
