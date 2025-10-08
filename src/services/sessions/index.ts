import { ApiClient, defaultApiClient } from "@/lib/api/client";
import { apiRoutes } from "@/lib/api/routes";
import {
  ScenarioProgress,
  SessionDraftPayload,
  SessionSubmissionRequest,
  SessionSummaryResponse,
  SessionStatus,
} from "@/domain/models";

export interface CreateSessionRequest {
  token: string;
  role?: string;
}

export interface CreateSessionResponse {
  sessionId: string;
  surveyId: string;
  respondentId: string;
  status: SessionStatus;
  progress: number;
}

export class SessionService {
  constructor(private readonly api: ApiClient = defaultApiClient) {}

  async createOrResumeSession({ token, role }: CreateSessionRequest): Promise<CreateSessionResponse> {
    return this.api.request<CreateSessionResponse>(apiRoutes.sessionCreate(token), "POST", { role });
  }

  async saveDraft(payload: SessionDraftPayload): Promise<void> {
    await this.api.request<void>(apiRoutes.sessionDraft(payload.sessionId), "PATCH", payload);
  }

  async submitSession(request: SessionSubmissionRequest): Promise<void> {
    await this.api.request<void>(apiRoutes.sessionSubmit(request.sessionId), "POST", request);
  }

  async getSummary(sessionId: string): Promise<SessionSummaryResponse> {
    return this.api.request<SessionSummaryResponse>(apiRoutes.sessionSummary(sessionId), "GET");
  }
}

export const sessionService = new SessionService();
