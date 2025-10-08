import { Indicator, ScenarioDefinition, SurveyMetadata } from "@/domain/models";

/**
 * Mock data para prototipo de encuesta dengue
 * 19 escenarios epidemiológicos + 69 indicadores
 */

export const MOCK_SURVEY: SurveyMetadata = {
  id: "survey-dengue-2025",
  title: "Validación de Indicadores Epidemiológicos - Dengue 2025",
  version: "1.0",
  description:
    "Encuesta para ponderar la relevancia de 69 indicadores en 19 escenarios epidemiológicos diferentes",
  active: true,
  totalScenarios: 19,
  createdAt: "2025-01-15T00:00:00Z",
  updatedAt: "2025-01-15T00:00:00Z",
};

// 69 Indicadores epidemiológicos organizados por categorías
export const MOCK_INDICATORS: Indicator[] = [
  // Indicadores Entomológicos (1-15)
  { id: "IND-001", name: "Índice de Breteau", domainTags: ["entomología"], active: true },
  { id: "IND-002", name: "Índice de viviendas", domainTags: ["entomología"], active: true },
  { id: "IND-003", name: "Índice de recipientes", domainTags: ["entomología"], active: true },
  { id: "IND-004", name: "Densidad larvaria por hectárea", domainTags: ["entomología"], active: true },
  { id: "IND-005", name: "Densidad de adultos por trampa", domainTags: ["entomología"], active: true },
  { id: "IND-006", name: "Porcentaje de positividad larvaria", domainTags: ["entomología"], active: true },
  { id: "IND-007", name: "Tasa de oviposición", domainTags: ["entomología"], active: true },
  { id: "IND-008", name: "Índice de infestación predial", domainTags: ["entomología"], active: true },
  { id: "IND-009", name: "Resistencia a insecticidas", domainTags: ["entomología", "control"], active: true },
  { id: "IND-010", name: "Abundancia de criaderos potenciales", domainTags: ["entomología"], active: true },
  { id: "IND-011", name: "Proporción Aedes aegypti / otras especies", domainTags: ["entomología"], active: true },
  { id: "IND-012", name: "Índice de pupas por persona", domainTags: ["entomología"], active: true },
  { id: "IND-013", name: "Productividad de criaderos", domainTags: ["entomología"], active: true },
  { id: "IND-014", name: "Dispersión geográfica de focos", domainTags: ["entomología", "espacial"], active: true },
  { id: "IND-015", name: "Ciclo gonotrófico observado", domainTags: ["entomología"], active: true },

  // Indicadores Clínicos y Epidemiológicos (16-35)
  { id: "IND-016", name: "Tasa de incidencia acumulada", domainTags: ["epidemiología"], active: true },
  { id: "IND-017", name: "Tasa de mortalidad", domainTags: ["epidemiología", "gravedad"], active: true },
  { id: "IND-018", name: "Tasa de letalidad", domainTags: ["epidemiología", "gravedad"], active: true },
  { id: "IND-019", name: "Proporción de casos graves", domainTags: ["clínica", "gravedad"], active: true },
  { id: "IND-020", name: "Proporción de casos con signos de alarma", domainTags: ["clínica"], active: true },
  { id: "IND-021", name: "Número reproductivo efectivo (Rt)", domainTags: ["epidemiología", "modelado"], active: true },
  { id: "IND-022", name: "Duración promedio del brote", domainTags: ["epidemiología"], active: true },
  { id: "IND-023", name: "Velocidad de propagación (km/día)", domainTags: ["epidemiología", "espacial"], active: true },
  { id: "IND-024", name: "Edad promedio de los casos", domainTags: ["demografía"], active: true },
  { id: "IND-025", name: "Distribución por sexo", domainTags: ["demografía"], active: true },
  { id: "IND-026", name: "Casos en población vulnerable (embarazadas, niños)", domainTags: ["clínica", "demografía"], active: true },
  { id: "IND-027", name: "Proporción de casos hospitalizados", domainTags: ["clínica"], active: true },
  { id: "IND-028", name: "Días promedio de hospitalización", domainTags: ["clínica"], active: true },
  { id: "IND-029", name: "Tasa de reinfección", domainTags: ["epidemiología"], active: true },
  { id: "IND-030", name: "Circulación simultánea de serotipos", domainTags: ["virología"], active: true },
  { id: "IND-031", name: "Proporción de casos confirmados por laboratorio", domainTags: ["laboratorio"], active: true },
  { id: "IND-032", name: "Tiempo promedio de confirmación diagnóstica", domainTags: ["laboratorio"], active: true },
  { id: "IND-033", name: "Proporción de casos autóctonos vs. importados", domainTags: ["epidemiología"], active: true },
  { id: "IND-034", name: "Tasa de ataque secundario", domainTags: ["epidemiología"], active: true },
  { id: "IND-035", name: "Intervalo serial promedio", domainTags: ["epidemiología"], active: true },

  // Indicadores Sociodemográficos y Ambientales (36-50)
  { id: "IND-036", name: "Densidad poblacional", domainTags: ["demografía", "espacial"], active: true },
  { id: "IND-037", name: "Índice de hacinamiento", domainTags: ["social"], active: true },
  { id: "IND-038", name: "Cobertura de servicios de agua", domainTags: ["infraestructura"], active: true },
  { id: "IND-039", name: "Frecuencia de recolección de residuos", domainTags: ["infraestructura"], active: true },
  { id: "IND-040", name: "Temperatura media mensual", domainTags: ["clima"], active: true },
  { id: "IND-041", name: "Humedad relativa promedio", domainTags: ["clima"], active: true },
  { id: "IND-042", name: "Precipitación acumulada", domainTags: ["clima"], active: true },
  { id: "IND-043", name: "Índice de marginación social", domainTags: ["social"], active: true },
  { id: "IND-044", name: "Nivel socioeconómico predominante", domainTags: ["social"], active: true },
  { id: "IND-045", name: "Accesibilidad geográfica a servicios de salud", domainTags: ["infraestructura", "espacial"], active: true },
  { id: "IND-046", name: "Uso del suelo (urbano/periurbano/rural)", domainTags: ["espacial"], active: true },
  { id: "IND-047", name: "Índice de vegetación NDVI", domainTags: ["espacial", "clima"], active: true },
  { id: "IND-048", name: "Proximidad a cuerpos de agua", domainTags: ["espacial", "entomología"], active: true },
  { id: "IND-049", name: "Tasa de migración poblacional", domainTags: ["demografía"], active: true },
  { id: "IND-050", name: "Cobertura de alcantarillado", domainTags: ["infraestructura"], active: true },

  // Indicadores de Control y Respuesta (51-69)
  { id: "IND-051", name: "Cobertura de eliminación de criaderos", domainTags: ["control"], active: true },
  { id: "IND-052", name: "Frecuencia de fumigación", domainTags: ["control"], active: true },
  { id: "IND-053", name: "Cobertura de tratamiento focal", domainTags: ["control"], active: true },
  { id: "IND-054", name: "Tiempo de respuesta desde la notificación", domainTags: ["respuesta"], active: true },
  { id: "IND-055", name: "Proporción de viviendas visitadas", domainTags: ["control"], active: true },
  { id: "IND-056", name: "Personal entrenado disponible", domainTags: ["recursos"], active: true },
  { id: "IND-057", name: "Disponibilidad de insumos (insecticidas, trampas)", domainTags: ["recursos"], active: true },
  { id: "IND-058", name: "Capacidad hospitalaria disponible", domainTags: ["recursos"], active: true },
  { id: "IND-059", name: "Proporción de casos notificados oportunamente", domainTags: ["vigilancia"], active: true },
  { id: "IND-060", name: "Tasa de búsqueda activa de casos", domainTags: ["vigilancia"], active: true },
  { id: "IND-061", name: "Cobertura de campañas educativas", domainTags: ["prevención"], active: true },
  { id: "IND-062", name: "Participación comunitaria en control", domainTags: ["prevención", "social"], active: true },
  { id: "IND-063", name: "Inversión presupuestaria per cápita", domainTags: ["recursos"], active: true },
  { id: "IND-064", name: "Coordinación intersectorial", domainTags: ["gestión"], active: true },
  { id: "IND-065", name: "Existencia de plan de contingencia", domainTags: ["gestión"], active: true },
  { id: "IND-066", name: "Calidad de los registros epidemiológicos", domainTags: ["vigilancia"], active: true },
  { id: "IND-067", name: "Integración de sistemas de información", domainTags: ["vigilancia"], active: true },
  { id: "IND-068", name: "Evaluación de efectividad de intervenciones", domainTags: ["gestión"], active: true },
  { id: "IND-069", name: "Percepción de riesgo poblacional", domainTags: ["social", "prevención"], active: true },
];

// 19 Escenarios epidemiológicos
export const MOCK_SCENARIOS: ScenarioDefinition[] = [
  {
    id: "SCN-001",
    surveyId: MOCK_SURVEY.id,
    title: "Área sin transmisión, con vector presente",
    description:
      "Zona donde existe presencia de Aedes aegypti pero no hay casos autóctonos registrados en los últimos 12 meses",
    order: 1,
    domainTags: ["prevención", "entomología"],
    indicators: MOCK_INDICATORS.slice(0, 15).map((ind) => ({ indicatorId: ind.id })),
  },
  {
    id: "SCN-002",
    surveyId: MOCK_SURVEY.id,
    title: "Transmisión esporádica en zona urbana",
    description: "Casos aislados sin evidencia de transmisión sostenida en áreas urbanas densamente pobladas",
    order: 2,
    domainTags: ["epidemiología", "urbano"],
    indicators: MOCK_INDICATORS.slice(0, 25).map((ind) => ({ indicatorId: ind.id })),
  },
  {
    id: "SCN-003",
    surveyId: MOCK_SURVEY.id,
    title: "Brote activo en comunidad periurbana",
    description: "Transmisión activa con aumento sostenido de casos en zona periurbana con servicios limitados",
    order: 3,
    domainTags: ["epidemiología", "brote", "periurbano"],
    indicators: MOCK_INDICATORS.slice(5, 40).map((ind) => ({ indicatorId: ind.id })),
  },
  {
    id: "SCN-004",
    surveyId: MOCK_SURVEY.id,
    title: "Epidemia con circulación de múltiples serotipos",
    description: "Transmisión simultánea de 2 o más serotipos con aumento de casos graves",
    order: 4,
    domainTags: ["epidemiología", "gravedad", "virología"],
    indicators: MOCK_INDICATORS.slice(10, 45).map((ind) => ({ indicatorId: ind.id })),
  },
  {
    id: "SCN-005",
    surveyId: MOCK_SURVEY.id,
    title: "Temporada de alta transmisión (verano lluvioso)",
    description: "Periodo estacional con condiciones climáticas óptimas para proliferación vectorial",
    order: 5,
    domainTags: ["clima", "entomología", "estacional"],
    indicators: MOCK_INDICATORS.slice(0, 50).map((ind) => ({ indicatorId: ind.id })),
  },
  {
    id: "SCN-006",
    surveyId: MOCK_SURVEY.id,
    title: "Transmisión en zona de alta marginación social",
    description: "Área con vulnerabilidad socioeconómica elevada y acceso limitado a servicios básicos",
    order: 6,
    domainTags: ["social", "vulnerabilidad"],
    indicators: MOCK_INDICATORS.filter((ind) =>
      ["social", "infraestructura", "epidemiología", "control"].some((tag) => ind.domainTags.includes(tag))
    ).map((ind) => ({ indicatorId: ind.id })),
  },
  {
    id: "SCN-007",
    surveyId: MOCK_SURVEY.id,
    title: "Re-emergencia después de periodo sin casos",
    description: "Reaparición de transmisión tras 2+ años sin casos autóctonos",
    order: 7,
    domainTags: ["epidemiología", "vigilancia"],
    indicators: MOCK_INDICATORS.slice(0, 35).map((ind) => ({ indicatorId: ind.id })),
  },
  {
    id: "SCN-008",
    surveyId: MOCK_SURVEY.id,
    title: "Alta incidencia en población pediátrica",
    description: "Concentración de casos en menores de 15 años con riesgo elevado de formas graves",
    order: 8,
    domainTags: ["clínica", "demografía", "gravedad"],
    indicators: MOCK_INDICATORS.slice(15, 50).map((ind) => ({ indicatorId: ind.id })),
  },
  {
    id: "SCN-009",
    surveyId: MOCK_SURVEY.id,
    title: "Casos importados con riesgo de dispersión local",
    description: "Detección de casos en viajeros con potencial de iniciar transmisión autóctona",
    order: 9,
    domainTags: ["vigilancia", "epidemiología"],
    indicators: MOCK_INDICATORS.slice(0, 40).map((ind) => ({ indicatorId: ind.id })),
  },
  {
    id: "SCN-010",
    surveyId: MOCK_SURVEY.id,
    title: "Transmisión en zona rural dispersa",
    description: "Casos en comunidades rurales con difícil acceso y recursos limitados",
    order: 10,
    domainTags: ["rural", "accesibilidad"],
    indicators: MOCK_INDICATORS.filter((ind) =>
      ["espacial", "infraestructura", "recursos", "epidemiología"].some((tag) => ind.domainTags.includes(tag))
    ).map((ind) => ({ indicatorId: ind.id })),
  },
  {
    id: "SCN-011",
    surveyId: MOCK_SURVEY.id,
    title: "Resistencia vectorial a insecticidas convencionales",
    description: "Detección de resistencia que limita efectividad de control químico",
    order: 11,
    domainTags: ["entomología", "control"],
    indicators: MOCK_INDICATORS.filter((ind) =>
      ["entomología", "control", "recursos"].some((tag) => ind.domainTags.includes(tag))
    ).map((ind) => ({ indicatorId: ind.id })),
  },
  {
    id: "SCN-012",
    surveyId: MOCK_SURVEY.id,
    title: "Colapso de sistema de salud por alta demanda",
    description: "Saturación hospitalaria con casos graves excediendo capacidad de respuesta",
    order: 12,
    domainTags: ["clínica", "recursos", "gravedad"],
    indicators: MOCK_INDICATORS.slice(15, 60).map((ind) => ({ indicatorId: ind.id })),
  },
  {
    id: "SCN-013",
    surveyId: MOCK_SURVEY.id,
    title: "Transmisión en contexto de desastre natural",
    description: "Brote post-desastre (huracán, inundación) con infraestructura dañada",
    order: 13,
    domainTags: ["emergencia", "infraestructura"],
    indicators: MOCK_INDICATORS.filter((ind) =>
      ["infraestructura", "recursos", "clima", "epidemiología", "control"].some((tag) => ind.domainTags.includes(tag))
    ).map((ind) => ({ indicatorId: ind.id })),
  },
  {
    id: "SCN-014",
    surveyId: MOCK_SURVEY.id,
    title: "Transmisión urbana con alta movilidad poblacional",
    description: "Ciudad con flujos migratorios diarios que facilitan dispersión espacial",
    order: 14,
    domainTags: ["urbano", "espacial", "demografía"],
    indicators: MOCK_INDICATORS.slice(10, 55).map((ind) => ({ indicatorId: ind.id })),
  },
  {
    id: "SCN-015",
    surveyId: MOCK_SURVEY.id,
    title: "Control exitoso con reducción sostenida de casos",
    description: "Intervención efectiva que logró reducir 80%+ casos en 6 meses",
    order: 15,
    domainTags: ["control", "gestión", "éxito"],
    indicators: MOCK_INDICATORS.slice(0, 69).map((ind) => ({ indicatorId: ind.id })),
  },
  {
    id: "SCN-016",
    surveyId: MOCK_SURVEY.id,
    title: "Fallo de control vectorial por baja cobertura",
    description: "Persistencia de transmisión a pesar de intervenciones con cobertura <50%",
    order: 16,
    domainTags: ["control", "gestión"],
    indicators: MOCK_INDICATORS.filter((ind) =>
      ["control", "gestión", "recursos", "entomología", "epidemiología"].some((tag) => ind.domainTags.includes(tag))
    ).map((ind) => ({ indicatorId: ind.id })),
  },
  {
    id: "SCN-017",
    surveyId: MOCK_SURVEY.id,
    title: "Transmisión con participación comunitaria activa",
    description: "Comunidad organizada con alto nivel de involucramiento en prevención",
    order: 17,
    domainTags: ["social", "prevención", "participación"],
    indicators: MOCK_INDICATORS.filter((ind) =>
      ["social", "prevención", "control", "epidemiología"].some((tag) => ind.domainTags.includes(tag))
    ).map((ind) => ({ indicatorId: ind.id })),
  },
  {
    id: "SCN-018",
    surveyId: MOCK_SURVEY.id,
    title: "Vigilancia intensificada en zona fronteriza",
    description: "Área limítrofe con país endémico que requiere vigilancia reforzada",
    order: 18,
    domainTags: ["vigilancia", "frontera", "epidemiología"],
    indicators: MOCK_INDICATORS.slice(15, 65).map((ind) => ({ indicatorId: ind.id })),
  },
  {
    id: "SCN-019",
    surveyId: MOCK_SURVEY.id,
    title: "Introducción de nueva cepa viral",
    description: "Detección de variante genética no circulante previamente en la región",
    order: 19,
    domainTags: ["virología", "epidemiología", "emergencia"],
    indicators: MOCK_INDICATORS.slice(10, 60).map((ind) => ({ indicatorId: ind.id })),
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
    totalScenarios: 19,
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
    totalScenarios: 19,
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
    totalScenarios: 19,
    status: "in-progress" as const,
    lastActivity: "2025-01-16T14:20:00Z",
  },
];
