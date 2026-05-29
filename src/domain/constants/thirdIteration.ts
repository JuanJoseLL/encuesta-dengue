/**
 * Tercera Iteración
 *
 * En la tercera iteración solo se trabaja la ponderación (peso) de los
 * indicadores —sin umbrales— y únicamente sobre el siguiente subconjunto de
 * estrategias. Las estrategias se identifican por su campo `codigo`.
 *
 * Si una estrategia no está en esta lista, no aparece en la tercera iteración.
 */
export const THIRD_ITERATION_STRATEGY_CODIGOS: string[] = [
  "Comunicación de riesgo / Comunitario", // Difundir mensajes preventivos inmediatos (SMS, redes, radios)
  "Vector / Biológico / Larvas", // Métodos biológicos para control larvario (Bti, guppies, copépodos)
  "Vector / Control químico / Larvas", // Larvicidas químicos en criaderos de gran volumen
  "Ambiental / Comunitario / Cultural", // Fortalecer la percepción de riesgo del dengue
  "Ambiental / Clima", // Monitorear condiciones climáticas y gestionar escorrentías
  "Ambiental / Social", // Promover prácticas preventivas sostenibles
  "Ambiental / Control físico", // Control físico en el entorno domiciliario
  "Vigilancia / Predicción / Clima", // Datos meteorológicos y modelos de alerta temprana
  "Reservorio / Reservorios humanos", // Diagnóstico oportuno, tratamiento y acompañamiento
  "Vector / Biológico / Adultos", // Control vectorial basado en biotecnología (Wolbachia)
  "Ambiental / Político", // Fortalecer la articulación institucional
];

/**
 * Indica si una estrategia (por su `codigo`) participa en la tercera iteración.
 */
export function isThirdIterationStrategy(codigo?: string | null): boolean {
  if (!codigo) return false;
  return THIRD_ITERATION_STRATEGY_CODIGOS.includes(codigo);
}

/**
 * Subconjunto de indicadores (por `id`) que participan en la tercera iteración.
 *
 * Son 53 de los 69 indicadores. Cualquier indicador que no esté en esta lista
 * NO debe aparecer en la tercera iteración (vista consolidada, progreso ni
 * exports), aunque tenga datos provenientes de la segunda iteración.
 *
 * Los IDs se almacenan como string en la base de datos (ver prisma/seed.ts).
 *
 * Excluidos (16): 7 Nivel de infestación crítica, 18 Tipo de brote,
 * 28 Inicio/mantenimiento de brote histórico, 34 Percepción de riesgo
 * comunitario, 45 Rechazo comunitario a intervención, 53 Disponibilidad de
 * equipos, 54 Personal en terreno, 55 Disponibilidad de insumos, 58 Tiempo de
 * alistamiento de brigadas, 59 Tiempo promedio de ejecución, 60 Cobertura
 * territorial por brigada, 61 Costos unitarios por intervención, 62
 * Disponibilidad logística semanal, 63 Capacidad máxima por comuna, 65
 * Reducción de IB tras control larvario, 67 Tasa de reinfestación.
 */
export const THIRD_ITERATION_INDICATOR_IDS: string[] = [
  "1", "2", "3", "4", "5", "6", "8", "9", "10", "11",
  "12", "13", "14", "15", "16", "17", "19", "20", "21", "22",
  "23", "24", "25", "26", "27", "29", "30", "31", "32", "33",
  "35", "36", "37", "38", "39", "40", "41", "42", "43", "44",
  "46", "47", "48", "49", "50", "51", "52", "56", "57", "64",
  "66", "68", "69",
];

const THIRD_ITERATION_INDICATOR_ID_SET = new Set(THIRD_ITERATION_INDICATOR_IDS);

/**
 * Indica si un indicador (por su `id`) participa en la tercera iteración.
 */
export function isThirdIterationIndicator(indicatorId?: string | null): boolean {
  if (!indicatorId) return false;
  return THIRD_ITERATION_INDICATOR_ID_SET.has(indicatorId);
}
