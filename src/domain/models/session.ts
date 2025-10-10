import { StrategyProgress } from "./strategy";
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
  currentStrategyId?: string;
  logs?: SessionLog[];
  metadata?: Record<string, unknown>;
}

export interface SessionLog {
  id: string;
  sessionId: string;
  event: "autosave" | "strategy-enter" | "strategy-exit" | "submit" | "resume";
  strategyId?: string;
  payload?: Record<string, unknown>;
  timestamp: string;
}

export interface SessionDraftPayload {
  sessionId: string;
  strategyProgress: StrategyProgress;
  autosave: boolean;
}
