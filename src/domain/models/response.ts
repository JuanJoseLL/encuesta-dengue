export interface IndicatorWeightDraft {
  indicatorId: string;
  weight: number;
  justification?: string;
  threshold?: number | null;
}

export interface StrategyResponsePayload {
  sessionId: string;
  strategyId: string;
  weights: IndicatorWeightDraft[];
  copiedFromStrategyId?: string;
  remainingWeight?: number;
}

export interface SessionSubmissionRequest {
  sessionId: string;
  acknowledgeIncomplete?: boolean;
  notes?: string;
}

export interface SessionSummaryItem {
  strategyId: string;
  strategyTitle: string;
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
