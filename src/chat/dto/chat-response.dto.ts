import { OrchestrationResult } from "../../mental-health-orchestrator/mental-health-orchestrator.service";

export interface ChatCreateResponse {
  message: any;
  orchestration?: OrchestrationResult | null;
}
