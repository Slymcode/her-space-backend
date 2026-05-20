import { OrchestrationResult } from "../../mental-health-orchestrator/mental-health-orchestrator.service";

export interface JournalEntryResponse {
  entry: any;
  orchestration?: OrchestrationResult | null;
}
