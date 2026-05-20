import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { MoodModule } from "./mood/mood.module";
import { JournalModule } from "./journal/journal.module";
import { ChatModule } from "./chat/chat.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    MoodModule,
    JournalModule,
    ChatModule,
  ],
})
export class AppModule {}
