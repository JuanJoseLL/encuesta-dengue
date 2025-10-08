export interface SurveyMetadata {
  id: string;
  title: string;
  version: string;
  description?: string;
  active: boolean;
  totalScenarios: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SurveySummary extends SurveyMetadata {
  completionRate?: number;
  averageCompletionTimeMinutes?: number;
}
