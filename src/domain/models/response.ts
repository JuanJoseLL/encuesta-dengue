export interface IndicatorWeightDraft {
  indicatorId: string;
  weight: number;
  justification?: string;
}

export interface ScenarioResponsePayload {
  sessionId: string;
  scenarioId: string;
  weights: IndicatorWeightDraft[];
  copiedFromScenarioId?: string;
  remainingWeight?: number;
}

export interface SessionSubmissionRequest {
  sessionId: string;
  acknowledgeIncomplete?: boolean;
  notes?: string;
}

export interface SessionSummaryItem {
  scenarioId: string;
  scenarioTitle: string;
  status: "complete" | "incomplete" | "not-applicable";
  totalWeight: number;
  indicators: IndicatorWeightDraft[];
}

export interface SessionSummaryResponse {
  sessionId: string;
  progress: number;
  items: SessionSummaryItem[];
  warnings: string[];
}
