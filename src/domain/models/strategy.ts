import { IndicatorWeightDraft } from "./response";

export interface StrategyDefinition {
  id: string;
  surveyId: string;
  title: string;
  description?: string;
  order: number;
  indicators: StrategyIndicator[];
}

export interface StrategyIndicator {
  indicatorId: string;
  required?: boolean;
  defaultWeight?: number;
}

export interface StrategyProgress {
  strategyId: string;
  status: "pending" | "in-progress" | "completed" | "not-applicable";
  indicatorWeights: IndicatorWeightDraft[];
  lastUpdatedAt: string;
}

