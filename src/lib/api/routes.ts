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
};
