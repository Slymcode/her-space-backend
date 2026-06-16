import { Injectable } from "@nestjs/common";
import { hash, compare } from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    age: number,
    country: string,
    preferredLanguage: string,
  ) {
    const passwordHash = await hash(password, 10);

    return this.prisma.user.create({
      data: {
        email,
        passwordHash,
        profile: {
          create: {
            firstName,
            lastName,
            age,
            country,
            preferredLanguage,
            onboarded: false,
            emotionalGoals: [],
            stressTriggers: [],
          },
        },
        roles: {
          create: {
            role: "USER",
          },
        },
      },
      include: {
        profile: true,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
  }

  async validateUser(email: string, password: string) {
    const user = await this.findByEmail(email);
    if (!user) return null;

    const passwordMatches = await compare(password, user.passwordHash);
    if (!passwordMatches) return null;

    return user;
  }

  async updateProfile(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      age?: number;
      pronouns?: string;
      country?: string;
      preferredLanguage?: string;
      emotionalGoals?: string[];
      stressTriggers?: string[];
      onboarded?: boolean;
    },
  ) {
    return this.prisma.profile.update({
      where: { userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        age: data.age,
        pronouns: data.pronouns,
        country: data.country,
        preferredLanguage: data.preferredLanguage,
        emotionalGoals: data.emotionalGoals,
        stressTriggers: data.stressTriggers,
        onboarded: data.onboarded,
      },
    });
  }
}
