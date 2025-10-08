import { ApiClient, defaultApiClient } from "@/lib/api/client";
import { apiRoutes } from "@/lib/api/routes";
import { ScenarioDefinition, SurveyMetadata } from "@/domain/models";

export interface SurveyDefinitionResponse {
  survey: SurveyMetadata;
  scenarios: ScenarioDefinition[];
}

export class SurveyService {
  constructor(private readonly api: ApiClient = defaultApiClient) {}

  async getSurveyDefinition(surveyId: string): Promise<SurveyDefinitionResponse> {
    return this.api.request<SurveyDefinitionResponse>(apiRoutes.surveyDefinition(surveyId), "GET");
  }
}

export const surveyService = new SurveyService();
