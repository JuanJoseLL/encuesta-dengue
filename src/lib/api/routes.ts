export const apiRoutes = {
  // Surveys
  surveyGet: (surveyId: string) => `/api/surveys/${surveyId}`,

  // Sessions
  sessionGet: (token: string) => `/api/sessions?token=${encodeURIComponent(token)}`,
  sessionDraft: (sessionId: string) => `/api/sessions/${sessionId}/draft`,
  sessionSubmit: (sessionId: string) => `/api/sessions/${sessionId}/submit`,
  sessionSummary: (sessionId: string) => `/api/sessions/${sessionId}/summary`,

  // Indicators
  indicatorsGet: (params?: { domain?: string; search?: string; active?: boolean }) => {
    const searchParams = new URLSearchParams();
    if (params?.domain) searchParams.set("domain", params.domain);
    if (params?.search) searchParams.set("search", params.search);
    if (params?.active !== undefined) searchParams.set("active", String(params.active));
    const query = searchParams.toString();
    return `/api/indicators${query ? `?${query}` : ""}`;
  },

  // Exports
  exportCsv: (surveyId: string) => `/api/exports/csv?surveyId=${encodeURIComponent(surveyId)}`,

  // Second Iteration
  secondIterationConsolidated: (strategyId: string, sessionId?: string) => {
    const baseUrl = `/api/second-iteration/consolidated/${strategyId}`;
    return sessionId ? `${baseUrl}?sessionId=${encodeURIComponent(sessionId)}` : baseUrl;
  },
  secondIterationUserResponses: (sessionId: string, strategyId: string) =>
    `/api/second-iteration/session/${sessionId}/strategy/${strategyId}`,
  secondIterationStrategyStatus: (strategyId: string, token: string) =>
    `/api/second-iteration/strategy/${strategyId}/status?token=${encodeURIComponent(token)}`,
  secondIterationExport: (surveyId: string) =>
    `/api/second-iteration/export?surveyId=${encodeURIComponent(surveyId)}`,
};
