export const apiRoutes = {
  surveyDefinition: (surveyId: string) => `/surveys/${surveyId}/definition`,
  sessionCreate: (token: string) => `/sessions?token=${encodeURIComponent(token)}`,
  sessionDraft: (sessionId: string) => `/sessions/${sessionId}/draft`,
  sessionSubmit: (sessionId: string) => `/sessions/${sessionId}/submit`,
  sessionSummary: (sessionId: string) => `/sessions/${sessionId}/summary`,
  exportCsv: (surveyId: string) => `/exports/csv?surveyId=${encodeURIComponent(surveyId)}`,
};
