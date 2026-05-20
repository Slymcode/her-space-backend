import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateEmergencyContactDto } from "./dto/create-emergency-contact.dto";
import { UpdateEmergencyContactDto } from "./dto/update-emergency-contact.dto";
import { CreateCrisisEventDto } from "./dto/create-crisis-event.dto";
import { UpdateCrisisEventDto } from "./dto/update-crisis-event.dto";

@Injectable()
export class EmergencyService {
  constructor(private readonly prisma: PrismaService) {}

  // Emergency contacts
  async createContact(userId: string, dto: CreateEmergencyContactDto) {
    return this.prisma.emergencyContact.create({ data: { ...dto, userId } });
  }

  async listContacts(userId: string) {
    return this.prisma.emergencyContact.findMany({ where: { userId } });
  }

  async updateContact(
    userId: string,
    contactId: string,
    dto: UpdateEmergencyContactDto,
  ) {
    return this.prisma.emergencyContact.updateMany({
      where: { id: contactId, userId },
      data: dto,
    });
  }

  async deleteContact(userId: string, contactId: string) {
    return this.prisma.emergencyContact.deleteMany({
      where: { id: contactId, userId },
    });
  }

  // Crisis events
  async createCrisisEvent(userId: string, dto: CreateCrisisEventDto) {
    return this.prisma.crisisEvent.create({ data: { ...dto, userId } });
  }

  async listCrisisEvents(userId: string, limit: number = 50) {
    return this.prisma.crisisEvent.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async getCrisisEvent(userId: string, id: string) {
    return this.prisma.crisisEvent.findFirst({ where: { id, userId } });
  }

  async updateCrisisEvent(
    userId: string,
    id: string,
    dto: UpdateCrisisEventDto,
  ) {
    return this.prisma.crisisEvent.updateMany({
      where: { id, userId },
      data: dto,
    });
  }

  async deleteCrisisEvent(userId: string, id: string) {
    return this.prisma.crisisEvent.deleteMany({ where: { id, userId } });
  }
}
