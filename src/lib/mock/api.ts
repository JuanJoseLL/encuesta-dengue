/**
 * Mock API service for prototyping without backend
 * Simula delays realistas y estructura de respuestas
 */

import { MOCK_SURVEY, MOCK_SCENARIOS, MOCK_INDICATORS, MOCK_SESSIONS } from "./data";
import type { SurveyMetadata, ScenarioDefinition, Indicator } from "@/domain/models";

const SIMULATED_DELAY = 300; // ms

function delay(ms: number = SIMULATED_DELAY): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface SurveyDefinitionResponse {
  survey: SurveyMetadata;
  scenarios: ScenarioDefinition[];
  indicators: Indicator[];
}

export interface SessionResponse {
  sessionId: string;
  surveyId: string;
  role: string;
  progress: number;
  scenarioProgress: Record<
    string,
    {
      status: "pending" | "in-progress" | "completed" | "not-applicable";
      weights: Record<string, number>;
    }
  >;
}

/**
 * Mock API Client
 */
export const mockApi = {
  /**
   * GET /surveys/:id/definition
   */
  async getSurveyDefinition(surveyId: string): Promise<SurveyDefinitionResponse> {
    await delay();
    if (surveyId !== MOCK_SURVEY.id) {
      throw new Error("Survey not found");
    }
    return {
      survey: MOCK_SURVEY,
      scenarios: MOCK_SCENARIOS,
      indicators: MOCK_INDICATORS,
    };
  },

  /**
   * POST /sessions?token=xxx
   * Crea o recupera sesión por token
   */
  async getOrCreateSession(token: string): Promise<SessionResponse> {
    await delay();

    // Simular sesión nueva o existente
    const sessionId = `session-${token}`;

    return {
      sessionId,
      surveyId: MOCK_SURVEY.id,
      role: "", // Usuario debe seleccionar
      progress: 0,
      scenarioProgress: {},
    };
  },

  /**
   * PATCH /sessions/:id/draft
   * Guarda progreso parcial
   */
  async saveDraft(
    sessionId: string,
    scenarioId: string,
    weights: Record<string, number>
  ): Promise<{ success: boolean }> {
    await delay(150);

    // Simular guardado en localStorage para persistencia
    const key = `session-${sessionId}-${scenarioId}`;
    localStorage.setItem(key, JSON.stringify({ weights, updatedAt: new Date().toISOString() }));

    return { success: true };
  },

  /**
   * POST /sessions/:id/submit
   * Envío final
   */
  async submitSession(sessionId: string): Promise<{ success: boolean; message: string }> {
    await delay(500);

    // Simular validación final
    return {
      success: true,
      message: "Encuesta enviada exitosamente. ¡Gracias por tu participación!",
    };
  },

  /**
   * GET /sessions/:id/summary
   */
  async getSessionSummary(sessionId: string): Promise<SessionResponse> {
    await delay();

    // Recuperar datos de localStorage
    const scenarioProgress: SessionResponse["scenarioProgress"] = {};

    MOCK_SCENARIOS.forEach((scenario) => {
      const key = `session-${sessionId}-${scenario.id}`;
      const stored = localStorage.getItem(key);

      if (stored) {
        const { weights } = JSON.parse(stored);
        scenarioProgress[scenario.id] = {
          status: "completed",
          weights,
        };
      } else {
        scenarioProgress[scenario.id] = {
          status: "pending",
          weights: {},
        };
      }
    });

    const completed = Object.values(scenarioProgress).filter((p) => p.status === "completed").length;

    return {
      sessionId,
      surveyId: MOCK_SURVEY.id,
      role: localStorage.getItem(`session-${sessionId}-role`) || "",
      progress: completed,
      scenarioProgress,
    };
  },

  /**
   * Admin: GET /sessions (todas las sesiones)
   */
  async getAllSessions() {
    await delay();
    return MOCK_SESSIONS;
  },

  /**
   * Admin: GET /exports/csv
   */
  async exportCSV(surveyId: string): Promise<Blob> {
    await delay(800);

    // Generar CSV mock
    const headers = "respondent_id,role,scenario_id,indicator_id,weight,timestamp\n";
    const rows: string[] = [];

    MOCK_SESSIONS.forEach((session) => {
      MOCK_SCENARIOS.forEach((scenario) => {
        scenario.indicators.slice(0, 5).forEach((ind, idx) => {
          rows.push(
            `${session.respondentId},${session.role},${scenario.id},${ind.indicatorId},${15 + idx * 5},2025-01-16T12:00:00Z`
          );
        });
      });
    });

    const csv = headers + rows.join("\n");
    return new Blob([csv], { type: "text/csv" });
  },
};
