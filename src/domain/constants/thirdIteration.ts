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
  interpretation: string;
}

/**
 * Explicaciones breves para ayudar al experto a interpretar cada indicador en
 * la tercera iteración. Están redactadas como apoyo operativo, no como reemplazo
 * de la definición técnica del indicador.
 */
export const THIRD_ITERATION_INDICATOR_DETAILS: Record<string, ThirdIterationIndicatorDetail> = {
  "1": {
    whatMeasures: "La cantidad de criaderos positivos encontrados por cada 100 viviendas inspeccionadas.",
    interpretation: "En esta iteración, un IB alto debe entenderse como señal de transmisión vectorial activa en viviendas y puede justificar mayor peso a estrategias de control larvario, eliminación de criaderos y acciones focalizadas en barrios con mayor carga.",
  },
  "2": {
    whatMeasures: "La proporción de viviendas donde se encontró al menos un criadero positivo.",
    interpretation: "Ayuda a leer qué tan distribuido está el riesgo dentro del barrio. Si muchas viviendas tienen criaderos, conviene priorizar intervenciones domiciliarias, educación preventiva y cobertura amplia, no solo acciones puntuales.",
  },
  "3": {
    whatMeasures: "La proporción de depósitos inspeccionados que resultaron positivos para Aedes.",
    interpretation: "Permite identificar si el problema está concentrado en recipientes o depósitos específicos. Debe pesar más cuando la estrategia depende de intervenir depósitos, eliminar criaderos o aplicar control larvario.",
  },
  "4": {
    whatMeasures: "El tipo de recipiente que aparece con mayor frecuencia como depósito positivo.",
    interpretation: "Orienta el tipo de acción requerida. Si domina un depósito como tanque, lavadero, llanta o recipiente desechable, el indicador ayuda a escoger estrategias más ajustadas al origen real de los criaderos.",
  },
  "5": {
    whatMeasures: "La cantidad estimada de pupas por persona, como aproximación a la producción futura de mosquitos adultos.",
    interpretation: "Es útil para valorar riesgo cercano de aumento del vector. Cuando el índice pupal es alto, conviene dar más peso a acciones que corten rápidamente la producción de mosquitos.",
  },
  "6": {
    whatMeasures: "La proporción o número de ovitrampas con presencia de huevos de Aedes.",
    interpretation: "Sirve como alerta temprana de actividad del vector, incluso antes de observar aumento claro de casos. Debe pesar más en estrategias de vigilancia, focalización territorial y respuesta preventiva.",
  },
  "8": {
    whatMeasures: "La presencia de larvas de Aedes en sumideros urbanos inspeccionados.",
    interpretation: "Ayuda a decidir si el drenaje urbano está funcionando como fuente de reproducción. Si el valor es alto, las acciones sobre sumideros, canales y control ambiental deberían ganar relevancia.",
  },
  "9": {
    whatMeasures: "La proporción de predios positivos en lugares de alta concentración de personas.",
    interpretation: "Indica riesgo en espacios donde muchas personas se exponen en poco tiempo, como escuelas, mercados o instituciones. Debe pesar más cuando la estrategia busca proteger nodos de alta movilidad o contacto.",
  },
  "10": {
    whatMeasures: "La proporción de depósitos positivos dentro de lugares de concentración humana.",
    interpretation: "Complementa el indicador de predios al mostrar si el problema está en recipientes específicos dentro de esos lugares. Es relevante para priorizar inspección, control y mantenimiento en sitios colectivos.",
  },
  "11": {
    whatMeasures: "El porcentaje de mosquitos Aedes con Wolbachia establecido en la población local.",
    interpretation: "Permite valorar si una estrategia basada en Wolbachia tiene condiciones de sostenibilidad. Un establecimiento suficiente puede indicar continuidad; uno bajo puede requerir refuerzo, seguimiento o estrategias complementarias.",
  },
  "12": {
    whatMeasures: "El número de casos reportados durante la semana epidemiológica en el territorio evaluado.",
    interpretation: "Es una señal directa de carga actual de enfermedad. Cuando aumenta, debe empujar decisiones de respuesta rápida, comunicación de riesgo y control focalizado en las zonas con mayor notificación.",
  },
  "13": {
    whatMeasures: "Los casos nuevos ajustados por población, normalmente por cada 100.000 habitantes.",
    interpretation: "Permite comparar barrios o comunas con tamaños de población distintos. Debe pesar más cuando se busca priorizar territorios de forma proporcional al riesgo y no solo por número absoluto de casos.",
  },
  "14": {
    whatMeasures: "La posición del territorio dentro del canal endémico: seguridad, alerta, epidemia u otra zona definida.",
    interpretation: "Resume si el comportamiento semanal está dentro de lo esperado o por encima de lo habitual. En zona de alerta o epidemia, las estrategias de respuesta y contención deberían tener mayor prioridad.",
  },
  "15": {
    whatMeasures: "El crecimiento de casos frente al mismo periodo del año anterior.",
    interpretation: "Ayuda a detectar aceleración epidémica comparando con una referencia conocida. Si la razón sube, el indicador favorece acciones anticipadas antes de que el brote se consolide.",
  },
  "16": {
    whatMeasures: "El cambio porcentual reciente en los casos o eventos vigilados.",
    interpretation: "Sirve para captar variaciones rápidas. Una variación positiva importante debe interpretarse como alerta de cambio de tendencia y puede justificar aumentar el peso de estrategias de respuesta temprana.",
  },
  "17": {
    whatMeasures: "La diferencia entre la situación actual y el promedio de años anteriores.",
    interpretation: "Permite distinguir fluctuaciones normales de comportamientos inusuales. Si el valor supera el promedio histórico, debe apoyar decisiones de intensificación o focalización territorial.",
  },
  "19": {
    whatMeasures: "La proporción de casos de dengue que requieren hospitalización.",
    interpretation: "Muestra presión clínica y posible severidad del evento. Si aumenta, conviene dar más peso a estrategias que reduzcan rápidamente transmisión y fortalezcan detección, comunicación y atención oportuna.",
  },
  "20": {
    whatMeasures: "La edad típica o promedio de las personas hospitalizadas por dengue.",
    interpretation: "Ayuda a identificar grupos más afectados o vulnerables. Si la hospitalización se concentra en niños, adultos mayores u otro grupo, el indicador orienta mensajes, vigilancia y protección diferenciada.",
  },
  "21": {
    whatMeasures: "La distribución de hospitalizaciones según tipo clínico o gravedad.",
    interpretation: "Permite ver si la carga hospitalaria se concentra en casos con signos de alarma o dengue grave. Debe pesar más cuando la estrategia busca evitar complicaciones y reducir presión sobre servicios de salud.",
  },
  "22": {
    whatMeasures: "La distribución de casos según clasificación clínica: sin alarma, con alarma o grave.",
    interpretation: "Da contexto sobre severidad y no solo cantidad de casos. Si crece la proporción de casos con alarma o graves, las acciones de comunicación, consulta temprana y respuesta sanitaria deben ganar peso.",
  },
  "23": {
    whatMeasures: "La proporción de casos que cuentan con confirmación por laboratorio.",
    interpretation: "Ayuda a valorar la certeza de la señal epidemiológica. Una baja confirmación puede indicar necesidad de cautela, pero también de reforzar vigilancia, diagnóstico y oportunidad de confirmación.",
  },
  "24": {
    whatMeasures: "La proporción de muertes atribuidas o probables por dengue frente al total de casos.",
    interpretation: "Es una señal crítica de desenlace grave. Aunque el número sea bajo, debe aumentar la prioridad de estrategias de atención oportuna, comunicación de signos de alarma y reducción rápida de transmisión.",
  },
  "25": {
    whatMeasures: "El número de muertes probables asociadas a dengue en el periodo o territorio.",
    interpretation: "Funciona como alerta de máxima gravedad para la respuesta. Su presencia debe influir en priorizar acciones intensivas, revisión clínica, comunicación urgente y control en el área relacionada.",
  },
  "26": {
    whatMeasures: "Los días promedio entre el inicio de síntomas y la primera consulta.",
    interpretation: "Indica oportunidad de búsqueda de atención. Si las personas consultan tarde, deben pesar más las estrategias de comunicación de riesgo, reconocimiento de signos de alarma y acceso temprano a servicios.",
  },
  "27": {
    whatMeasures: "Los días promedio entre la consulta y la notificación al sistema de vigilancia.",
    interpretation: "Mide oportunidad del sistema para activar respuesta. Si la notificación se demora, conviene priorizar mejoras de vigilancia, coordinación institucional y respuesta operativa más ágil.",
  },
  "29": {
    whatMeasures: "Los serotipos de dengue que están circulando y su frecuencia relativa.",
    interpretation: "Ayuda a estimar riesgo de expansión o severidad por circulación simultánea. La presencia de varios serotipos puede justificar mayor peso a vigilancia, comunicación y control preventivo.",
  },
  "30": {
    whatMeasures: "El tiempo entre aparición, notificación y confirmación de los casos en el sistema.",
    interpretation: "Resume la oportunidad de la información para tomar decisiones. Si el tiempo es alto, la respuesta puede llegar tarde, por lo que deben ganar peso estrategias que reduzcan demoras de vigilancia y confirmación.",
  },
  "31": {
    whatMeasures: "La cantidad de organizaciones sociales o comunitarias activas en la zona.",
    interpretation: "Indica capacidad local para movilizar mensajes, visitas y acciones sostenidas. Pocas organizaciones pueden limitar estrategias comunitarias; muchas pueden facilitar campañas, vigilancia social y adherencia.",
  },
  "32": {
    whatMeasures: "Un índice compuesto de condiciones sociales como pobreza, hacinamiento o educación.",
    interpretation: "Ayuda a reconocer territorios donde el dengue puede tener mayor impacto y menor capacidad de respuesta. Debe pesar más cuando la estrategia requiere focalizar recursos en población vulnerable.",
  },
  "33": {
    whatMeasures: "La concentración de habitantes por área en el barrio o comuna.",
    interpretation: "Una mayor densidad puede acelerar exposición y transmisión en entornos urbanos. Este indicador debe orientar estrategias de cobertura amplia, comunicación masiva y control en zonas de alta concentración.",
  },
  "35": {
    whatMeasures: "La proporción de población alcanzada por actividades de educación preventiva.",
    interpretation: "Muestra si la comunidad ya recibió información suficiente para actuar. Una cobertura baja sugiere dar más peso a comunicación de riesgo y educación práctica antes o junto con acciones de control.",
  },
  "36": {
    whatMeasures: "La adopción de prácticas preventivas en hogares y comunidad.",
    interpretation: "Permite estimar si las recomendaciones se están convirtiendo en acciones. Si las prácticas son bajas, deben priorizarse estrategias que cambien comportamiento y mantengan prevención cotidiana.",
  },
  "37": {
    whatMeasures: "La cobertura de inspección y control realizada sobre sumideros.",
    interpretation: "Indica si una fuente urbana importante está siendo atendida. Coberturas bajas deben aumentar el peso de estrategias ambientales y operativas enfocadas en sumideros y drenaje.",
  },
  "38": {
    whatMeasures: "La cobertura de inspección e intervención en viviendas.",
    interpretation: "Muestra alcance del control domiciliario. Si la cobertura es baja en zonas con riesgo, conviene priorizar visitas, eliminación de criaderos y acciones que lleguen directamente al hogar.",
  },
  "39": {
    whatMeasures: "La cobertura de inspección y control en lugares donde se concentra mucha población.",
    interpretation: "Ayuda a proteger puntos con alta exposición colectiva. Debe pesar más cuando hay escuelas, mercados, instituciones u otros sitios que pueden amplificar el riesgo de contacto.",
  },
  "40": {
    whatMeasures: "La proporción de instituciones educativas cubiertas por inspección o intervención.",
    interpretation: "Sirve para valorar protección en población escolar y espacios de alta permanencia. Coberturas bajas pueden justificar priorizar acciones en colegios y entornos educativos.",
  },
  "41": {
    whatMeasures: "La cobertura de inspección y control biológico en cuerpos de agua o depósitos grandes.",
    interpretation: "Es relevante cuando existen criaderos que no se eliminan fácilmente. Debe pesar más en estrategias de control biológico y seguimiento de depósitos permanentes.",
  },
  "42": {
    whatMeasures: "La actividad económica predominante o presencia de obras y dinámicas urbanas que pueden modificar el riesgo.",
    interpretation: "Ayuda a anticipar criaderos, movilidad y exposición asociados a ciertas actividades. Debe considerarse cuando la estrategia depende de coordinar con sectores económicos, obras o actores privados.",
  },
  "43": {
    whatMeasures: "La proporción de población con acceso adecuado a agua potable.",
    interpretation: "Baja cobertura puede llevar al almacenamiento de agua en recipientes, aumentando criaderos. En ese contexto, deben pesar más acciones sobre depósitos, educación y gestión ambiental.",
  },
  "44": {
    whatMeasures: "La regularidad del suministro de agua en horas o continuidad del servicio.",
    interpretation: "La intermitencia favorece almacenamiento doméstico y criaderos. Si la continuidad es baja, conviene priorizar control de depósitos, comunicación específica y coordinación con servicios públicos.",
  },
  "46": {
    whatMeasures: "La presencia de basureros ilegales o puntos críticos donde se acumulan residuos.",
    interpretation: "Estos puntos pueden generar recipientes expuestos a lluvia y criaderos. Deben pesar más las estrategias de saneamiento, control ambiental y articulación con aseo urbano.",
  },
  "47": {
    whatMeasures: "La condición de canales pluviales, especialmente si están limpios, obstruidos o con agua estancada.",
    interpretation: "Canales obstruidos pueden retener agua y sostener criaderos después de lluvias. Este indicador favorece estrategias de mantenimiento, drenaje y gestión ambiental focalizada.",
  },
  "48": {
    whatMeasures: "La condición operativa de los sumideros urbanos, incluyendo limpieza u obstrucción.",
    interpretation: "Sumideros obstruidos pueden convertirse en criaderos persistentes. Si el indicador es alto, deben ganar peso las acciones de inspección, limpieza y control larvario en infraestructura urbana.",
  },
  "49": {
    whatMeasures: "La proporción del barrio cubierta por zonas verdes y arbolado.",
    interpretation: "La cobertura vegetal puede modificar humedad, sombra y permanencia de recipientes o criaderos. Debe interpretarse junto con lluvia, residuos y control ambiental antes de priorizar acciones.",
  },
  "50": {
    whatMeasures: "La frecuencia semanal con la que se recolectan residuos sólidos.",
    interpretation: "Recolección insuficiente favorece acumulación de recipientes que pueden llenarse de agua. Debe pesar más cuando se evalúan estrategias de limpieza, saneamiento y prevención comunitaria.",
  },
  "51": {
    whatMeasures: "Precipitación acumulada en los últimos 7 días, en milímetros.",
    interpretation: "Este indicador se activa cuando la precipitación de la semana supera el comportamiento histórico esperado para esa misma semana en ese barrio (percentil 90 de los últimos 6 años).",
  },
  "52": {
    whatMeasures: "La temperatura máxima registrada en los días previos.",
    interpretation: "La temperatura afecta actividad del mosquito, evaporación y eficacia de algunas acciones químicas. Debe pesar más cuando las condiciones térmicas pueden acelerar el ciclo vectorial o limitar una intervención.",
  },
  "56": {
    whatMeasures: "El tiempo entre la notificación de un caso y la primera acción de control vectorial.",
    interpretation: "Mide capacidad de respuesta operativa. Si la respuesta tarda, el brote puede avanzar antes de intervenir; por eso deben pesar más estrategias que acorten tiempos y prioricen zonas críticas.",
  },
  "57": {
    whatMeasures: "La proporción del área de brote cubierta por eliminación de criaderos o control químico.",
    interpretation: "Indica si la intervención llega a suficiente territorio para tener efecto. Coberturas bajas sugieren reforzar capacidad operativa, focalización y seguimiento de la zona intervenida.",
  },
  "64": {
    whatMeasures: "La reducción esperada de casos después de aplicar una intervención.",
    interpretation: "Ayuda a ponderar impacto probable, no solo factibilidad. Debe pesar más cuando se compara entre estrategias y se busca priorizar las que podrían reducir más casos en el corto plazo.",
  },
  "66": {
    whatMeasures: "La proporción de hogares que mantienen prácticas preventivas después de la intervención educativa.",
    interpretation: "Mide sostenibilidad del aprendizaje comunitario. Si la retención es baja, deben ganar peso estrategias de refuerzo, acompañamiento y comunicación repetida, no solo mensajes únicos.",
  },
  "68": {
    whatMeasures: "La disponibilidad de camas hospitalarias o UCI para atender dengue grave.",
    interpretation: "Indica margen del sistema de salud ante aumento de severidad. Si hay pocas camas libres, conviene priorizar estrategias que reduzcan transmisión, consulta tardía y progresión a casos graves.",
  },
  "69": {
    whatMeasures: "La proporción de hogares alcanzados con mensajes de riesgo sobre dengue.",
    interpretation: "Permite valorar alcance real de la comunicación. Si la cobertura es baja, deben pesar más estrategias de mensajes focalizados, canales comunitarios y comunicación oportuna en zonas de brote.",
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
