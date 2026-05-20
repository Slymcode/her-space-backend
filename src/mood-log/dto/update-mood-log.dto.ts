import { PartialType } from "@nestjs/mapped-types";
import { CreateMoodLogDto } from "./create-mood-log.dto";

export class UpdateMoodLogDto extends PartialType(CreateMoodLogDto) {}
