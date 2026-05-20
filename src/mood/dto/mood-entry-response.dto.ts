import { OrchestrationResult } from "../../mental-health-orchestrator/mental-health-orchestrator.service";

export interface MoodEntryResponse {
  entry: any;
  orchestration?: OrchestrationResult | null;
}

export type MoodEntriesResponse = MoodEntryResponse[] | any[];
