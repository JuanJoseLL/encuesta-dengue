import { ScenarioProgress } from "./scenario";
import { SessionStatus } from "../constants/statuses";

export interface ResponseSession {
  id: string;
  surveyId: string;
  respondentId: string;
  token: string;
  progress: number; // 0 - 1
  status: SessionStatus;
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
  currentScenarioId?: string;
  logs?: SessionLog[];
  metadata?: Record<string, unknown>;
}

export interface SessionLog {
  id: string;
  sessionId: string;
  event: "autosave" | "scenario-enter" | "scenario-exit" | "submit" | "resume";
  scenarioId?: string;
  payload?: Record<string, unknown>;
  timestamp: string;
}

export interface SessionDraftPayload {
  sessionId: string;
  scenarioProgress: ScenarioProgress;
  autosave: boolean;
}
