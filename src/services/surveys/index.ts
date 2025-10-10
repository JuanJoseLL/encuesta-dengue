import { ApiClient, defaultApiClient } from "@/lib/api/client";
import { apiRoutes } from "@/lib/api/routes";
import { StrategyDefinition, SurveyMetadata, Indicator } from "@/domain/models";

export interface SurveyDefinitionResponse {
  survey: SurveyMetadata;
  strategies: StrategyDefinition[];
  indicators: Indicator[];
}

export class SurveyService {
  constructor(private readonly api: ApiClient = defaultApiClient) {}

  async getSurveyDefinition(surveyId: string): Promise<SurveyDefinitionResponse> {
    return this.api.request<SurveyDefinitionResponse>(apiRoutes.surveyGet(surveyId), "GET");
  }
}

export const surveyService = new SurveyService();
