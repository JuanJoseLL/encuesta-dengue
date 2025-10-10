import { Indicator, StrategyDefinition, SurveyMetadata } from "@/domain/models";

/**
 * Mock data para prototipo de encuesta dengue
 * 19 estrategias epidemiológicos + 69 indicadores
 */

export const MOCK_SURVEY: SurveyMetadata = {
  id: "survey-dengue-2025",
  title: "Validación de Indicadores Epidemiológicos - Dengue 2025",
  version: "1.0",
  description:
    "Encuesta para ponderar la relevancia de 69 indicadores en 19 estrategias epidemiológicos diferentes",
  active: true,
  totalStrategies: 19,
  createdAt: "2025-01-15T00:00:00Z",
  updatedAt: "2025-01-15T00:00:00Z",
};

// 69 Indicadores epidemiológicos organizados por categorías
export const MOCK_INDICATORS: Indicator[] = [
  // Indicadores Entomológicos (1-15)
  { id: "IND-001", name: "Índice de Breteau", domain: "entomological", tags: ["entomología"], active: true },
  { id: "IND-002", name: "Índice de viviendas", domain: "entomological", tags: ["entomología"], active: true },
  { id: "IND-003", name: "Índice de recipientes", domain: "entomological", tags: ["entomología"], active: true },
  { id: "IND-004", name: "Densidad larvaria por hectárea", domain: "entomological", tags: ["entomología"], active: true },
  { id: "IND-005", name: "Densidad de adultos por trampa", domain: "entomological", tags: ["entomología"], active: true },
  { id: "IND-006", name: "Porcentaje de positividad larvaria", domain: "entomological", tags: ["entomología"], active: true },
  { id: "IND-007", name: "Tasa de oviposición", domain: "entomological", tags: ["entomología"], active: true },
  { id: "IND-008", name: "Índice de infestación predial", domain: "entomological", tags: ["entomología"], active: true },
  { id: "IND-009", name: "Resistencia a insecticidas", domain: "entomological", tags: ["entomología", "control"], active: true },
  { id: "IND-010", name: "Abundancia de criaderos potenciales", domain: "entomological", tags: ["entomología"], active: true },
  { id: "IND-011", name: "Proporción Aedes aegypti / otras especies", domain: "entomological", tags: ["entomología"], active: true },
  { id: "IND-012", name: "Índice de pupas por persona", domain: "entomological", tags: ["entomología"], active: true },
  { id: "IND-013", name: "Productividad de criaderos", domain: "entomological", tags: ["entomología"], active: true },
  { id: "IND-014", name: "Dispersión geográfica de focos", domain: "entomological", tags: ["entomología", "espacial"], active: true },
  { id: "IND-015", name: "Ciclo gonotrófico observado", domain: "entomological", tags: ["entomología"], active: true },

  // Indicadores Clínicos y Epidemiológicos (16-35)
  { id: "IND-016", name: "Tasa de incidencia acumulada", domain: "epidemiological", tags: ["epidemiología"], active: true },
  { id: "IND-017", name: "Tasa de mortalidad", domain: "epidemiological", tags: ["epidemiología", "gravedad"], active: true },
  { id: "IND-018", name: "Tasa de letalidad", domain: "epidemiological", tags: ["epidemiología", "gravedad"], active: true },
  { id: "IND-019", name: "Proporción de casos graves", domain: "clinical", tags: ["clínica", "gravedad"], active: true },
  { id: "IND-020", name: "Proporción de casos con signos de alarma", domain: "clinical", tags: ["clínica"], active: true },
  { id: "IND-021", name: "Número reproductivo efectivo (Rt)", domain: "epidemiological", tags: ["epidemiología", "modelado"], active: true },
  { id: "IND-022", name: "Duración promedio del brote", domain: "epidemiological", tags: ["epidemiología"], active: true },
  { id: "IND-023", name: "Velocidad de propagación (km/día)", domain: "epidemiological", tags: ["epidemiología", "espacial"], active: true },
  { id: "IND-024", name: "Edad promedio de los casos", domain: "epidemiological", tags: ["demografía"], active: true },
  { id: "IND-025", name: "Distribución por sexo", domain: "epidemiological", tags: ["demografía"], active: true },
  { id: "IND-026", name: "Casos en población vulnerable (embarazadas, niños)", domain: "clinical", tags: ["clínica", "demografía"], active: true },
  { id: "IND-027", name: "Proporción de casos hospitalizados", domain: "clinical", tags: ["clínica"], active: true },
  { id: "IND-028", name: "Días promedio de hospitalización", domain: "clinical", tags: ["clínica"], active: true },
  { id: "IND-029", name: "Tasa de reinfección", domain: "epidemiological", tags: ["epidemiología"], active: true },
  { id: "IND-030", name: "Circulación simultánea de serotipos", domain: "epidemiological", tags: ["virología"], active: true },
  { id: "IND-031", name: "Proporción de casos confirmados por laboratorio", domain: "clinical", tags: ["laboratorio"], active: true },
  { id: "IND-032", name: "Tiempo promedio de confirmación diagnóstica", domain: "clinical", tags: ["laboratorio"], active: true },
  { id: "IND-033", name: "Proporción de casos autóctonos vs. importados", domain: "epidemiological", tags: ["epidemiología"], active: true },
  { id: "IND-034", name: "Tasa de ataque secundario", domain: "epidemiological", tags: ["epidemiología"], active: true },
  { id: "IND-035", name: "Intervalo serial promedio", domain: "epidemiological", tags: ["epidemiología"], active: true },

  // Indicadores Sociodemográficos y Ambientales (36-50)
  { id: "IND-036", name: "Densidad poblacional", domain: "social", tags: ["demografía", "espacial"], active: true },
  { id: "IND-037", name: "Índice de hacinamiento", domain: "social", tags: ["social"], active: true },
  { id: "IND-038", name: "Cobertura de servicios de agua", domain: "environmental", tags: ["infraestructura"], active: true },
  { id: "IND-039", name: "Frecuencia de recolección de residuos", domain: "environmental", tags: ["infraestructura"], active: true },
  { id: "IND-040", name: "Temperatura media mensual", domain: "environmental", tags: ["clima"], active: true },
  { id: "IND-041", name: "Humedad relativa promedio", domain: "environmental", tags: ["clima"], active: true },
  { id: "IND-042", name: "Precipitación acumulada", domain: "environmental", tags: ["clima"], active: true },
  { id: "IND-043", name: "Índice de marginación social", domain: "social", tags: ["social"], active: true },
  { id: "IND-044", name: "Nivel socioeconómico predominante", domain: "social", tags: ["social"], active: true },
  { id: "IND-045", name: "Accesibilidad geográfica a servicios de salud", domain: "environmental", tags: ["infraestructura", "espacial"], active: true },
  { id: "IND-046", name: "Uso del suelo (urbano/periurbano/rural)", domain: "environmental", tags: ["espacial"], active: true },
  { id: "IND-047", name: "Índice de vegetación NDVI", domain: "environmental", tags: ["espacial", "clima"], active: true },
  { id: "IND-048", name: "Proximidad a cuerpos de agua", domain: "environmental", tags: ["espacial", "entomología"], active: true },
  { id: "IND-049", name: "Tasa de migración poblacional", domain: "social", tags: ["demografía"], active: true },
  { id: "IND-050", name: "Cobertura de alcantarillado", domain: "environmental", tags: ["infraestructura"], active: true },

  // Indicadores de Control y Respuesta (51-69)
  { id: "IND-051", name: "Cobertura de eliminación de criaderos", domain: "control", tags: ["control"], active: true },
  { id: "IND-052", name: "Frecuencia de fumigación", domain: "control", tags: ["control"], active: true },
  { id: "IND-053", name: "Cobertura de tratamiento focal", domain: "control", tags: ["control"], active: true },
  { id: "IND-054", name: "Tiempo de respuesta desde la notificación", domain: "control", tags: ["respuesta"], active: true },
  { id: "IND-055", name: "Proporción de viviendas visitadas", domain: "control", tags: ["control"], active: true },
  { id: "IND-056", name: "Personal entrenado disponible", domain: "control", tags: ["recursos"], active: true },
  { id: "IND-057", name: "Disponibilidad de insumos (insecticidas, trampas)", domain: "control", tags: ["recursos"], active: true },
  { id: "IND-058", name: "Capacidad hospitalaria disponible", domain: "control", tags: ["recursos"], active: true },
  { id: "IND-059", name: "Proporción de casos notificados oportunamente", domain: "epidemiological", tags: ["vigilancia"], active: true },
  { id: "IND-060", name: "Tasa de búsqueda activa de casos", domain: "epidemiological", tags: ["vigilancia"], active: true },
  { id: "IND-061", name: "Cobertura de campañas educativas", domain: "control", tags: ["prevención"], active: true },
  { id: "IND-062", name: "Participación comunitaria en control", domain: "social", tags: ["prevención", "social"], active: true },
  { id: "IND-063", name: "Inversión presupuestaria per cápita", domain: "control", tags: ["recursos"], active: true },
  { id: "IND-064", name: "Coordinación intersectorial", domain: "control", tags: ["gestión"], active: true },
  { id: "IND-065", name: "Existencia de plan de contingencia", domain: "control", tags: ["gestión"], active: true },
  { id: "IND-066", name: "Calidad de los registros epidemiológicos", domain: "epidemiological", tags: ["vigilancia"], active: true },
  { id: "IND-067", name: "Integración de sistemas de información", domain: "epidemiological", tags: ["vigilancia"], active: true },
  { id: "IND-068", name: "Evaluación de efectividad de intervenciones", domain: "control", tags: ["gestión"], active: true },
  { id: "IND-069", name: "Percepción de riesgo poblacional", domain: "social", tags: ["social", "prevención"], active: true },
];

// 19 Estrategias de mitigación
export const MOCK_STRATEGIES: any[] = [
  {
    id: "STR-001",
    surveyId: MOCK_SURVEY.id,
    title: "Vigilancia epidemiológica intensiva",
    description: "Fortalecimiento de sistemas de detección, notificación y análisis de casos",
    order: 1,
  },
  {
    id: "STR-002",
    surveyId: MOCK_SURVEY.id,
    title: "Control larvario focal",
    description: "Eliminación de criaderos y aplicación de larvicidas",
    order: 2,
  },
  {
    id: "STR-003",
    surveyId: MOCK_SURVEY.id,
    title: "Fumigación espacial (adulticida)",
    description: "Aplicación de insecticidas para mosquitos adultos",
    order: 3,
  },
];

// Mock sessions para admin dashboard
export const MOCK_SESSIONS = [
  {
    id: "session-001",
    respondentId: "resp-001",
    respondentName: "Dr. Carlos Mendoza",
    role: "epidemiologist" as const,
    surveyId: MOCK_SURVEY.id,
    progress: 12,
    totalStrategies: 19,
    status: "in-progress" as const,
    lastActivity: "2025-01-16T10:30:00Z",
  },
  {
    id: "session-002",
    respondentId: "resp-002",
    respondentName: "Dra. Ana Herrera",
    role: "entomologist" as const,
    surveyId: MOCK_SURVEY.id,
    progress: 19,
    totalStrategies: 19,
    status: "completed" as const,
    lastActivity: "2025-01-15T18:45:00Z",
  },
  {
    id: "session-003",
    respondentId: "resp-003",
    respondentName: "Lic. Roberto Sánchez",
    role: "public-health" as const,
    surveyId: MOCK_SURVEY.id,
    progress: 5,
    totalStrategies: 19,
    status: "in-progress" as const,
    lastActivity: "2025-01-16T14:20:00Z",
  },
];
