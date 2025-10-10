export interface SurveyMetadata {
  id: string;
  title: string;
  version: string;
  description?: string;
  active: boolean;
  totalStrategies: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SurveySummary extends SurveyMetadata {
  completionRate?: number;
  averageCompletionTimeMinutes?: number;
}
