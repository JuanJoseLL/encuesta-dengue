import { IndicatorWeightDraft } from "./response";

export interface ScenarioDefinition {
  id: string;
  surveyId: string;
  title: string;
  description?: string;
  order: number;
  domainTags: string[];
  indicators: ScenarioIndicator[];
}

export interface ScenarioIndicator {
  indicatorId: string;
  required?: boolean;
  defaultWeight?: number;
}

export interface ScenarioProgress {
  scenarioId: string;
  status: "pending" | "in-progress" | "completed" | "not-applicable";
  indicatorWeights: IndicatorWeightDraft[];
  lastUpdatedAt: string;
}
