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
