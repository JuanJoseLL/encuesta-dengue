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

export interface ThirdIterationIndicatorDetail {
  whatMeasures: string;
  whenActivates: string;
}

/**
 * Para cada indicador: qué mide y cuándo se activa (la condición de activación
 * derivada del umbral definido para el indicador). Sirven de apoyo operativo en
 * la tercera iteración, no reemplazan la definición técnica del indicador.
 */
export const THIRD_ITERATION_INDICATOR_DETAILS: Record<string, ThirdIterationIndicatorDetail> = {
  "1": {
    whatMeasures: "La cantidad de criaderos positivos encontrados por cada 100 viviendas inspeccionadas.",
    whenActivates: "Se activa cuando el Índice de Breteau supera 20 criaderos positivos por cada 100 viviendas inspeccionadas, señal de alta infestación y transmisión vectorial activa.",
  },
  "2": {
    whatMeasures: "La proporción de viviendas donde se encontró al menos un criadero positivo.",
    whenActivates: "Se activa cuando más del 10% de las viviendas inspeccionadas tienen al menos un criadero positivo, lo que indica un riesgo distribuido en el barrio.",
  },
  "3": {
    whatMeasures: "La proporción de depósitos inspeccionados que resultaron positivos para Aedes.",
    whenActivates: "Se activa cuando más del 5% de los depósitos inspeccionados resultan positivos para Aedes.",
  },
  "4": {
    whatMeasures: "El tipo de recipiente que aparece con mayor frecuencia como depósito positivo.",
    whenActivates: "Se activa cuando un mismo tipo de depósito (por ejemplo tanque o lavadero) concentra al menos el 40% de los criaderos positivos, orientando el tipo de intervención requerida.",
  },
  "5": {
    whatMeasures: "La cantidad estimada de pupas por persona, como aproximación a la producción futura de mosquitos adultos.",
    whenActivates: "Se activa cuando el índice pupal supera 1 pupa por persona, anticipando un aumento cercano en la producción de mosquitos adultos.",
  },
  "6": {
    whatMeasures: "La proporción o número de ovitrampas con presencia de huevos de Aedes.",
    whenActivates: "Se activa cuando más del 60% de las ovitrampas presentan huevos de Aedes, alerta temprana de actividad del vector.",
  },
  "8": {
    whatMeasures: "La presencia de larvas de Aedes en sumideros urbanos inspeccionados.",
    whenActivates: "Se activa cuando más del 5% de los sumideros inspeccionados presentan larvas de Aedes, señal de que el drenaje urbano está funcionando como criadero.",
  },
  "9": {
    whatMeasures: "La proporción de predios positivos en lugares de alta concentración de personas.",
    whenActivates: "Se activa cuando más del 1% de los predios en lugares de alta concentración de personas (escuelas, mercados, instituciones) resultan positivos.",
  },
  "10": {
    whatMeasures: "La proporción de depósitos positivos dentro de lugares de concentración humana.",
    whenActivates: "Se activa cuando más del 2% de los depósitos en lugares de concentración humana resultan positivos.",
  },
  "11": {
    whatMeasures: "El porcentaje de mosquitos Aedes con Wolbachia establecido en la población local.",
    whenActivates: "Se activa cuando el establecimiento de Wolbachia supera el 60% de los mosquitos locales, umbral que sugiere una colonización suficiente para sostener la estrategia.",
  },
  "12": {
    whatMeasures: "El número de casos reportados durante la semana epidemiológica en el territorio evaluado.",
    whenActivates: "Se activa cuando se reportan más de 3 casos por barrio en la semana epidemiológica, señal de carga actual de enfermedad.",
  },
  "13": {
    whatMeasures: "Los casos nuevos ajustados por población, normalmente por cada 100.000 habitantes.",
    whenActivates: "Se activa cuando la incidencia supera 20 casos por cada 100.000 habitantes en la semana, permitiendo comparar el riesgo entre territorios de distinto tamaño.",
  },
  "14": {
    whatMeasures: "La posición del territorio dentro del canal endémico: seguridad, alerta, epidemia u otra zona definida.",
    whenActivates: "Se activa cuando el territorio entra en zona de alerta o epidemia del canal endémico, es decir, por encima del comportamiento esperado.",
  },
  "15": {
    whatMeasures: "El crecimiento de casos frente al mismo periodo del año anterior.",
    whenActivates: "Se activa cuando los casos superan 1,3 veces los del mismo periodo del año anterior, señal de aceleración epidémica.",
  },
  "16": {
    whatMeasures: "El cambio porcentual reciente en los casos o eventos vigilados.",
    whenActivates: "Se activa cuando los casos aumentan más del 10% respecto al periodo previo, alerta de cambio de tendencia.",
  },
  "17": {
    whatMeasures: "La diferencia entre la situación actual y el promedio de años anteriores.",
    whenActivates: "Se activa cuando la situación actual supera en más del 15% el promedio de los años anteriores, indicando un comportamiento inusual.",
  },
  "19": {
    whatMeasures: "La proporción de casos de dengue que requieren hospitalización.",
    whenActivates: "Se activa cuando más del 10% de los casos de dengue requieren hospitalización, señal de mayor presión clínica y severidad.",
  },
  "20": {
    whatMeasures: "La edad típica o promedio de las personas hospitalizadas por dengue.",
    whenActivates: "Se activa cuando la hospitalización se concentra en menores de 15 años, grupo de mayor vulnerabilidad.",
  },
  "21": {
    whatMeasures: "La distribución de hospitalizaciones según tipo clínico o gravedad.",
    whenActivates: "Se activa cuando más del 20% de las hospitalizaciones corresponden a casos con signos de alarma o dengue grave.",
  },
  "22": {
    whatMeasures: "La distribución de casos según clasificación clínica: sin alarma, con alarma o grave.",
    whenActivates: "Se activa cuando más del 20% de los casos presentan signos de alarma, indicando mayor severidad y no solo más casos.",
  },
  "23": {
    whatMeasures: "La proporción de casos que cuentan con confirmación por laboratorio.",
    whenActivates: "Se activa cuando menos del 60% de los casos cuentan con confirmación de laboratorio, lo que reduce la certeza de la señal epidemiológica.",
  },
  "24": {
    whatMeasures: "La proporción de muertes atribuidas o probables por dengue frente al total de casos.",
    whenActivates: "Se activa cuando la letalidad supera el 0,05% de los casos, señal crítica de desenlaces graves.",
  },
  "25": {
    whatMeasures: "El número de muertes probables asociadas a dengue en el periodo o territorio.",
    whenActivates: "Se activa cuando se registra al menos una muerte probable por dengue en la comuna, alerta de máxima gravedad.",
  },
  "26": {
    whatMeasures: "Los días promedio entre el inicio de síntomas y la primera consulta.",
    whenActivates: "Se activa cuando, en promedio, las personas tardan más de 3 días en consultar desde el inicio de síntomas.",
  },
  "27": {
    whatMeasures: "Los días promedio entre la consulta y la notificación al sistema de vigilancia.",
    whenActivates: "Se activa cuando la notificación al sistema de vigilancia tarda más de 2 días desde la consulta.",
  },
  "29": {
    whatMeasures: "Los serotipos de dengue que están circulando y su frecuencia relativa.",
    whenActivates: "Se activa cuando circulan 2 o más serotipos de dengue de forma simultánea, aumentando el riesgo de expansión o severidad.",
  },
  "30": {
    whatMeasures: "El tiempo entre aparición, notificación y confirmación de los casos en el sistema.",
    whenActivates: "Se activa cuando la notificación y confirmación de casos tarda más de 72 horas, retrasando la capacidad de respuesta.",
  },
  "31": {
    whatMeasures: "La cantidad de organizaciones sociales o comunitarias activas en la zona.",
    whenActivates: "Se activa cuando hay menos de 2 organizaciones sociales activas por comuna, lo que limita la capacidad de movilización comunitaria.",
  },
  "32": {
    whatMeasures: "Un índice compuesto de condiciones sociales como pobreza, hacinamiento o educación.",
    whenActivates: "Se activa cuando el índice de vulnerabilidad socioeconómica supera 0,6, señal de territorios con mayor impacto potencial y menor capacidad de respuesta.",
  },
  "33": {
    whatMeasures: "La concentración de habitantes por área en el barrio o comuna.",
    whenActivates: "Se activa cuando la densidad supera 10.000 habitantes por km², condición que puede acelerar la exposición y la transmisión.",
  },
  "35": {
    whatMeasures: "La proporción de población alcanzada por actividades de educación preventiva.",
    whenActivates: "Se activa cuando la educación preventiva ha alcanzado menos del 60% de la población, indicando una cobertura insuficiente.",
  },
  "36": {
    whatMeasures: "La adopción de prácticas preventivas en hogares y comunidad.",
    whenActivates: "Se activa cuando menos del 50% de los hogares aplican prácticas preventivas.",
  },
  "37": {
    whatMeasures: "La cobertura de inspección y control realizada sobre sumideros.",
    whenActivates: "Se activa cuando la cobertura de inspección y control de sumideros es menor al 80%.",
  },
  "38": {
    whatMeasures: "La cobertura de inspección e intervención en viviendas.",
    whenActivates: "Se activa cuando la cobertura de inspección y control en viviendas es menor al 70%.",
  },
  "39": {
    whatMeasures: "La cobertura de inspección y control en lugares donde se concentra mucha población.",
    whenActivates: "Se activa cuando se ha visitado menos del 80% de los lugares de concentración humana.",
  },
  "40": {
    whatMeasures: "La proporción de instituciones educativas cubiertas por inspección o intervención.",
    whenActivates: "Se activa cuando la cobertura en instituciones educativas es menor al 80%.",
  },
  "41": {
    whatMeasures: "La cobertura de inspección y control biológico en cuerpos de agua o depósitos grandes.",
    whenActivates: "Se activa cuando se ha controlado menos del 80% de los cuerpos de agua o depósitos grandes identificados.",
  },
  "42": {
    whatMeasures: "La actividad económica predominante o presencia de obras y dinámicas urbanas que pueden modificar el riesgo.",
    whenActivates: "Se activa cuando hay más de 3 obras o dinámicas urbanas por km² que pueden modificar el riesgo (criaderos, movilidad, exposición).",
  },
  "43": {
    whatMeasures: "La proporción de población con acceso adecuado a agua potable.",
    whenActivates: "Se activa cuando menos del 90% de la población tiene acceso adecuado a agua potable, lo que favorece el almacenamiento en recipientes.",
  },
  "44": {
    whatMeasures: "La regularidad del suministro de agua en horas o continuidad del servicio.",
    whenActivates: "Se activa cuando el servicio de acueducto está disponible menos de 20 horas al día, favoreciendo el almacenamiento doméstico y los criaderos.",
  },
  "46": {
    whatMeasures: "La presencia de basureros ilegales o puntos críticos donde se acumulan residuos.",
    whenActivates: "Se activa cuando hay más de un punto crítico de residuos por km², potenciales fuentes de recipientes expuestos a la lluvia.",
  },
  "47": {
    whatMeasures: "La condición de canales pluviales, especialmente si están limpios, obstruidos o con agua estancada.",
    whenActivates: "Se activa cuando más del 30% de los canales pluviales están obstruidos, lo que retiene agua y sostiene criaderos tras las lluvias.",
  },
  "48": {
    whatMeasures: "La condición operativa de los sumideros urbanos, incluyendo limpieza u obstrucción.",
    whenActivates: "Se activa cuando más del 20% de los sumideros están obstruidos, condición que los convierte en criaderos persistentes.",
  },
  "49": {
    whatMeasures: "La proporción del barrio cubierta por zonas verdes y arbolado.",
    whenActivates: "Se activa cuando más del 30% del área del barrio corresponde a zonas verdes o arbolado, lo que puede modificar humedad, sombra y permanencia de criaderos.",
  },
  "50": {
    whatMeasures: "La frecuencia semanal con la que se recolectan residuos sólidos.",
    whenActivates: "Se activa cuando los residuos sólidos se recolectan menos de 2 veces por semana, favoreciendo la acumulación de recipientes.",
  },
  "51": {
    whatMeasures: "Precipitación acumulada en los últimos 7 días, en milímetros.",
    whenActivates: "Este indicador se activa cuando la precipitación de la semana supera el comportamiento histórico esperado para esa misma semana en ese barrio (percentil 90 de los últimos 6 años).",
  },
  "52": {
    whatMeasures: "La temperatura máxima registrada en los días previos.",
    whenActivates: "Se activa cuando la temperatura máxima de los días previos supera los 27°C, condición que puede acelerar el ciclo del vector.",
  },
  "56": {
    whatMeasures: "El tiempo entre la notificación de un caso y la primera acción de control vectorial.",
    whenActivates: "Se activa cuando el control vectorial tarda más de 72 horas en iniciarse desde la notificación del caso.",
  },
  "57": {
    whatMeasures: "La proporción del área de brote cubierta por eliminación de criaderos o control químico.",
    whenActivates: "Se activa cuando se ha intervenido menos del 60% de las manzanas en la zona de brote, cobertura insuficiente para tener efecto.",
  },
  "64": {
    whatMeasures: "La reducción esperada de casos después de aplicar una intervención.",
    whenActivates: "Se activa cuando la reducción esperada de casos tras la intervención es menor al 70%, señalando un impacto probable limitado.",
  },
  "66": {
    whatMeasures: "La proporción de hogares que mantienen prácticas preventivas después de la intervención educativa.",
    whenActivates: "Se activa cuando menos del 70% de los hogares mantienen las prácticas aprendidas tras la intervención educativa.",
  },
  "68": {
    whatMeasures: "La disponibilidad de camas hospitalarias o UCI para atender dengue grave.",
    whenActivates: "Se activa cuando queda menos del 10% de camas hospitalarias o UCI libres para atender dengue grave, reduciendo el margen del sistema de salud.",
  },
  "69": {
    whatMeasures: "La proporción de hogares alcanzados con mensajes de riesgo sobre dengue.",
    whenActivates: "Se activa cuando los mensajes de riesgo han alcanzado menos del 60% de los hogares.",
  },
};

export function getThirdIterationIndicatorDetail(
  indicatorId?: string | null
): ThirdIterationIndicatorDetail | null {
  if (!indicatorId) return null;
  return THIRD_ITERATION_INDICATOR_DETAILS[indicatorId] ?? null;
}

/**
 * Tiempo estimado que le toma a la brigada respectiva poner cada estrategia en
 * ejecución efectiva en terreno, una vez tomada la decisión de implementarla.
 *
 * Fuente: «19_Estrategias_definitivas.xlsx» (columna «Tiempo estimado para
 * accionar la estrategia (En días)», valor provisto por Andrés). Se conserva el
 * rango tal cual aparece en el archivo, normalizando únicamente el espaciado.
 *
 * Las estrategias se identifican por su `codigo` (ver prisma/seed.ts). El mapa
 * incluye las 19 estrategias; en la tercera iteración solo se muestran las que
 * estén en THIRD_ITERATION_STRATEGY_CODIGOS.
 */
export const STRATEGY_LEAD_TIME_BY_CODIGO: Record<string, string> = {
  "Vector / Control químico / Adultos": "3 - 7 días",
  "Vector / Control químico / Larvas": "3 - 7 días",
  "Vector / Biológico / Larvas": "3 - 7 días",
  "Vector / Biológico / Adultos": "14 - 21 días",
  "Vector / Control físico / Larvas": "3 - 7 días",
  "Vector / Control físico / Adultos": "7 - 14 días",
  "Comunicación de riesgo / Comunitario": "3 - 7 días",
  "Contacto / Protección individual": "3 - 7 días",
  "Ambiental / Político": "14 - 21 días",
  "Ambiental / Comunitario / Cultural": "3 - 7 días",
  "Ambiental / Económico": ">30 días",
  "Ambiental / Control físico": "3 - 7 días",
  "Ambiental / Clima": "7 - 14 días",
  "Ambiental / Social": "3 - 7 días",
  "Susceptible / Prevención en el Huésped": "14 - 21 días",
  "Reservorio / Reservorios humanos": "7 - 14 días",
  "Gestión clínica / Institucional": "14 - 21 días",
  "Coordinación / Intersectorial": "7 - 14 días",
  "Vigilancia / Predicción / Clima": "3 - 7 días",
};

/**
 * Tiempo estimado para accionar la estrategia (por `codigo`).
 * Devuelve null si no hay un valor registrado para esa estrategia.
 */
export function getStrategyLeadTime(codigo?: string | null): string | null {
  if (!codigo) return null;
  return STRATEGY_LEAD_TIME_BY_CODIGO[codigo] ?? null;
}
