import { ApiClient, defaultApiClient } from "@/lib/api/client";
import { apiRoutes } from "@/lib/api/routes";
import {
  SessionSubmissionRequest,
  SessionSummaryResponse,
  SessionStatus,
} from "@/domain/models";

export interface LoadSessionResponse {
  session: {
    id: string;
    surveyId: string;
    respondentId: string;
    token: string;
    progress: number;
    status: SessionStatus;
    currentStrategyId?: string;
    responses: Array<{
      id: string;
      strategyId: string;
      indicatorId: string;
      weight: number;
      indicator: {
        id: string;
        name: string;
      };
      strategy: {
        id: string;
        title: string;
      };
    }>;
    survey: {
      id: string;
      title: string;
      strategies: Array<{
        id: string;
        title: string;
        description?: string;
        order: number;
      }>;
    };
  };
  message: string;
  alreadySubmitted?: boolean;
}

export interface SaveDraftResponse {
  session: {
    id: string;
    progress: number;
    updatedAt: string;
  };
  message: string;
  progress: number;
}

export class SessionService {
  constructor(private readonly api: ApiClient = defaultApiClient) {}

  async loadSession(token: string): Promise<LoadSessionResponse> {
    return this.api.request<LoadSessionResponse>(apiRoutes.sessionGet(token), "GET");
  }

  async saveDraft(
    sessionId: string,
    strategyId: string,
    weights: Array<{ indicatorId: string; weight: number }>,
    currentStrategyId?: string
  ): Promise<SaveDraftResponse> {
    return this.api.request<SaveDraftResponse>(apiRoutes.sessionDraft(sessionId), "PATCH", {
      strategyId,
      weights,
      currentStrategyId,
      autosave: true,
    });
  }

  async submitSession(request: SessionSubmissionRequest): Promise<void> {
    await this.api.request<void>(apiRoutes.sessionSubmit(request.sessionId), "POST", request);
  }

  async getSummary(sessionId: string): Promise<SessionSummaryResponse> {
    return this.api.request<SessionSummaryResponse>(apiRoutes.sessionSummary(sessionId), "GET");
  }
}

export const sessionService = new SessionService();
