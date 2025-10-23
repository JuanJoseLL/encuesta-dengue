/**
 * Escalas y unidades de medida para cada indicador (para mostrar en labels)
 * Los nombres deben coincidir exactamente con los del archivo seed.ts
 */
export const INDICATOR_SCALES: Record<string, string> = {
  // ===== ÍNDICES ENTOMOLÓGICOS (IDs 1-11) =====
  "Índice de Breteau (IB)": "Criaderos/100 viviendas",
  "Índice de vivienda (IV)": "% de viviendas",
  "Índice de depósito (ID)": "% de depósitos",
  "Tipo de depósito positivo dominante": "Tipo predominante",
  "Índice pupal": "Pupas/persona",
  "Número de ovitrampas positivas": "% de ovitrampas",
  "Nivel de infestación crítica": "IB o IV crítico",
  "Índice Aédico en sumidero": "% de sumideros",
  "Índice de predio en concentraciones humanas": "% de predios",
  "Índice de depósito en concentraciones humanas": "% de depósitos",
  "Establecimiento de Wolbachia": "% de mosquitos",
  
  // ===== VIGILANCIA EPIDEMIOLÓGICA (IDs 12-30) =====
  "Número de casos por semana epidemiológica": "Casos/semana/barrio",
  "Tasa de incidencia semanal": "Casos/100,000 hab",
  "Zona del canal endémico (situación)": "% del umbral endémico",
  "Razón de crecimiento epidémico frente al año anterior": "Razón de cambio",
  "Variación porcentual": "% de cambio",
  "Variación promedio vs. años anteriores": "% de variación",
  "Tipo de brote": "Tipo I/II según semanas",
  "Porcentaje de hospitalización por dengue": "% de casos",
  "Edad (moda, mediana, promedio) de hospitalización": "Años de edad",
  "Porcentaje de hospitalización por tipo": "% por tipo clínico",
  "Casos según clasificación clínica": "% según gravedad",
  "% de casos confirmados por laboratorio": "% de confirmación",
  "Letalidad": "Muertes/casos totales",
  "Muertes probables": "Número de muertes",
  "Tiempo entre síntoma y consulta": "Días promedio",
  "Tiempo entre consulta y notificación": "Días promedio",
  "Inicio y mantenimiento de brote histórico": "Barrios/zona",
  "Serotipos circulantes": "% por serotipo",
  "Tiempo de notificación y confirmación de casos": "Horas o días",
  
  // ===== VULNERABILIDAD SOCIAL (IDs 31-36, 45) =====
  "Número de organizaciones sociales": "Organizaciones/comuna",
  "Índice de Vulnerabilidad Socioeconómica": "Índice compuesto",
  "Densidad poblacional": "Hab/km²",
  "Percepción de riesgo comunitario": "% o escala 1-10",
  "Cobertura de educación preventiva": "% de población",
  "Prácticas preventivas": "% de hogares",
  "Rechazo comunitario a intervención": "% de hogares",
  
  // ===== CONTROL VECTORIAL (IDs 37-41) =====
  "Inspección y control de sumideros": "% de cobertura",
  "Inspección y control en viviendas": "% de cobertura",
  "Inspección y control en lugares de concentración humana": "% de cobertura",
  "Cobertura en instituciones educativas": "% de instituciones",
  "Inspección y control en cuerpos de agua (control biológico)": "% de depósitos",
  
  // ===== SECTOR ECONÓMICO-AMBIENTAL (IDs 42-52) =====
  "Sector económico": "Tipo de sector/obras",
  "Cobertura de agua potable": "% de población",
  "Continuidad en el servicio de acueducto": "Horas/día",
  "Presencia de basureros ilegales o puntos críticos de residuos": "Puntos/km²",
  "Estado de canales de aguas lluvias (limpios / obstruidos)": "% obstruidos",
  "Estado de sumideros (limpios / obstruidos)": "% obstruidos",
  "Cobertura de zonas verdes y árboles por barrio": "% de área",
  "Frecuencia de recolección de residuos sólidos": "Veces/semana",
  "Índice de pluviosidad (días previos)": "mm de lluvia",
  "Temperatura máxima (días previos)": "°C",
  
  // ===== OPERACIONALES Y LOGÍSTICOS (IDs 53-63) =====
  "Disponibilidad de equipos": "% operativos",
  "Personal en terreno": "Personas/habitantes",
  "Disponibilidad de insumos": "% de stock",
  "Tiempo de respuesta de control vectorial desde la notificación": "Días",
  "Cobertura de eliminación de criaderos o control químico en zonas de brote": "% de cobertura",
  "Tiempo de alistamiento de brigadas": "Días",
  "Tiempo promedio de ejecución": "Días/barrio",
  "Cobertura territorial por brigada": "Viviendas/día",
  "Costos unitarios por intervención": "USD/acción",
  "Disponibilidad logística semanal": "Brigadas/semana",
  "Capacidad máxima por comuna": "Viviendas/semana",
  
  // ===== IMPACTO (IDs 64-67) =====
  "Probabilidad de reducción de casos": "% de reducción",
  "Reducción de índice de Breteau tras control larvario": "% de reducción IB",
  "Retención de aprendizaje comunitario": "% de hogares",
  "Tasa de reinfestación": "Meses hasta reinfestación",
  
  // ===== SALUD (IDs 68-69) =====
  "Disponibilidad de camas hospitalarias/UCI para dengue grave": "Camas/100,000 hab",
  "Cobertura de hogares alcanzados con mensajes de riesgo": "% de hogares",
};

/**
 * Umbrales sugeridos para cada indicador (para la primera iteración)
 * Proporciona valores de referencia basados en literatura y práctica
 */
export const INDICATOR_THRESHOLDS: Record<string, string> = {
  // ===== ÍNDICES ENTOMOLÓGICOS (IDs 1-11) =====
  "Índice de Breteau (IB)": "> 20%",
  "Índice de vivienda (IV)": "> 10%",
  "Índice de depósito (ID)": "> 5%",
  "Tipo de depósito positivo dominante": "≥ 40% depósitos tipo tanque o lavadero",
  "Índice pupal": "> 1 pupa/persona",
  "Número de ovitrampas positivas": "> 60%",
  "Nivel de infestación crítica": "IB > 20% o IV > 10%",
  "Índice Aédico en sumidero": "> 5%",
  "Índice de predio en concentraciones humanas": "> 1% predios positivos",
  "Índice de depósito en concentraciones humanas": "> 2% depósitos positivos",
  "Establecimiento de Wolbachia": "> 60%",
  
  // ===== VIGILANCIA EPIDEMIOLÓGICA (IDs 12-30) =====
  "Número de casos por semana epidemiológica": "> 3 casos/barrio",
  "Tasa de incidencia semanal": "> 20/100,000 hab.",
  "Zona del canal endémico (situación)": "> zona de alerta",
  "Razón de crecimiento epidémico frente al año anterior": "> 1.3",
  "Variación porcentual": "> +10%",
  "Variación promedio vs. años anteriores": "> +15%",
  "Tipo de brote": "Tipo II (≥ 6 semanas)",
  "Porcentaje de hospitalización por dengue": "> 10%",
  "Edad (moda, mediana, promedio) de hospitalización": "< 15 años",
  "Porcentaje de hospitalización por tipo": "> 20% con signos de alarma",
  "Casos según clasificación clínica": "> 20% con signos de alarma",
  "% de casos confirmados por laboratorio": "< 60%",
  "Letalidad": "> 0.05%",
  "Muertes probables": "≥ 1 por comuna",
  "Tiempo entre síntoma y consulta": "> 3 días",
  "Tiempo entre consulta y notificación": "> 2 días",
  "Inicio y mantenimiento de brote histórico": "≥ 4 semanas continuas en ascenso",
  "Serotipos circulantes": "≥ 2 activos",
  "Tiempo de notificación y confirmación de casos": "> 72 h",
  
  // ===== VULNERABILIDAD SOCIAL (IDs 31-36, 45) =====
  "Número de organizaciones sociales": "< 2 por comuna",
  "Índice de Vulnerabilidad Socioeconómica": "> 0.6",
  "Densidad poblacional": "> 10,000 hab/km²",
  "Percepción de riesgo comunitario": "< 50%",
  "Cobertura de educación preventiva": "< 60%",
  "Prácticas preventivas": "< 50% hogares",
  "Rechazo comunitario a intervención": "> 10% hogares",
  
  // ===== CONTROL VECTORIAL (IDs 37-41) =====
  "Inspección y control de sumideros": "< 80% cobertura",
  "Inspección y control en viviendas": "< 70% cobertura",
  "Inspección y control en lugares de concentración humana": "< 80% sitios visitados",
  "Cobertura en instituciones educativas": "< 80%",
  "Inspección y control en cuerpos de agua (control biológico)": "< 80% puntos controlados",
  
  // ===== SECTOR ECONÓMICO-AMBIENTAL (IDs 42-52) =====
  "Sector económico": "> 3 obras/km²",
  "Cobertura de agua potable": "< 90%",
  "Continuidad en el servicio de acueducto": "< 20 h/día",
  "Presencia de basureros ilegales o puntos críticos de residuos": "> 1/km²",
  "Estado de canales de aguas lluvias (limpios / obstruidos)": "> 30% obstruidos",
  "Estado de sumideros (limpios / obstruidos)": "> 20% obstruidos",
  "Cobertura de zonas verdes y árboles por barrio": "> 30% área",
  "Frecuencia de recolección de residuos sólidos": "< 2 veces/semana",
  "Índice de pluviosidad (días previos)": "> 50 mm/7d",
  "Temperatura máxima (días previos)": "> 27°C",
  
  // ===== OPERACIONALES Y LOGÍSTICOS (IDs 53-63) =====
  "Disponibilidad de equipos": "< 80%",
  "Personal en terreno": "< 75%",
  "Disponibilidad de insumos": "< 70%",
  "Tiempo de respuesta de control vectorial desde la notificación": "> 72 h",
  "Cobertura de eliminación de criaderos o control químico en zonas de brote": "< 60% manzanas intervenidas",
  "Tiempo de alistamiento de brigadas": "> 48 horas",
  "Tiempo promedio de ejecución": "> 5 días / barrio",
  "Cobertura territorial por brigada": "< 1 barrio/día",
  "Costos unitarios por intervención": "> $3.000.000/barrio",
  "Disponibilidad logística semanal": "< 70%",
  "Capacidad máxima por comuna": "> 90% uso",
  
  // ===== IMPACTO (IDs 64-67) =====
  "Probabilidad de reducción de casos": "< 70% esperada post intervención",
  "Reducción de índice de Breteau tras control larvario": "< 20% del IB inicial tras 2 semanas",
  "Retención de aprendizaje comunitario": "< 70%",
  "Tasa de reinfestación": "< 4 semanas",
  
  // ===== SALUD (IDs 68-69) =====
  "Disponibilidad de camas hospitalarias/UCI para dengue grave": "< 10% libres",
  "Cobertura de hogares alcanzados con mensajes de riesgo": "< 60%",
};

/**
 * Obtiene la escala/unidad de medida para un indicador específico
 * @param indicatorName - Nombre del indicador
 * @returns La escala o null si no existe
 */
export function getIndicatorScale(indicatorName: string): string | null {
  return INDICATOR_SCALES[indicatorName] || null;
}

/**
 * Obtiene el umbral sugerido para un indicador específico
 * @param indicatorName - Nombre del indicador
 * @returns El umbral sugerido o null si no existe
 */
export function getIndicatorThreshold(indicatorName: string): string | null {
  return INDICATOR_THRESHOLDS[indicatorName] || null;
}
