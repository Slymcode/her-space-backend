import { PartialType } from "@nestjs/mapped-types";
import { CreateCrisisEventDto } from "./create-crisis-event.dto";

export class UpdateCrisisEventDto extends PartialType(CreateCrisisEventDto) {}
