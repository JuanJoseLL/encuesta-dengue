import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const indicators = [
  {
    id: 1,
    name: "Índice de Breteau (IB)",
    description: "Número de criaderos positivos por 100 viviendas inspeccionadas.",
    domain: "entomological",
  },
  {
    id: 2,
    name: "Índice de vivienda (IV)",
    description: "Porcentaje de viviendas con al menos un criadero positivo.",
    domain: "entomological",
  },
  {
    id: 3,
    name: "Índice de depósito (ID)",
    description: "Porcentaje de depósitos positivos sobre el total inspeccionado.",
    domain: "entomological",
  },
  {
    id: 4,
    name: "Tipo de depósito positivo dominante",
    description: "Tipo de recipiente o depósito más frecuentemente positivo (ej. botellas, neumáticos, tanques).",
    domain: "entomological",
  },
  {
    id: 5,
    name: "Índice pupal",
    description: "Número de pupas por persona (estimación de la densidad de preimaginales).",
    domain: "entomological",
  },
  {
    id: 6,
    name: "Número de ovitrampas positivas",
    description: "Conteo semanal de ovitrampas positivas por barrio.",
    domain: "entomological",
  },
  {
    id: 7,
    name: "Nivel de infestación crítica",
    description: "Zonas con IB > umbral establecido (ej. IB > 20) u otro umbral definido localmente.",
    domain: "entomological",
  },
  {
    id: 8,
    name: "Índice Aédico en sumidero",
    description: "Porcentaje de sumideros con presencia de larvas de Aedes.",
    domain: "entomological",
  },
  {
    id: 9,
    name: "Índice de predio en concentraciones humanas",
    description: "% de predios en lugares de concentración humana con al menos un criadero positivo.",
    domain: "entomological",
  },
  {
    id: 10,
    name: "Índice de depósito en concentraciones humanas",
    description: "% de depósitos positivos sobre el total inspeccionado en concentraciones humanas.",
    domain: "entomological",
  },
  {
    id: 11,
    name: "Establecimiento de Wolbachia",
    description: "% de mosquitos Aedes positivos para Wolbachia (indicar sexo si es relevante).",
    domain: "entomological",
  },
  {
    id: 12,
    name: "Número de casos por semana epidemiológica",
    description: "Número de casos reportados por cada semana epidemiológica.",
    domain: "epidemiological",
  },
  {
    id: 13,
    name: "Tasa de incidencia semanal",
    description: "Casos nuevos por 100.000 habitantes en la semana.",
    domain: "epidemiological",
  },
  {
    id: 14,
    name: "Zona del canal endémico (situación)",
    description: "Clasificación de la zona según la situación semanal de notificación (p. ej. endémico, epidémico, control).",
    domain: "epidemiological",
  },
  {
    id: 15,
    name: "Razón de crecimiento epidémico frente al año anterior",
    description: "Cambio porcentual de casos respecto al mismo periodo del año anterior.",
    domain: "epidemiological",
  },
  {
    id: 16,
    name: "Variación porcentual",
    description: "Cambio porcentual del número acumulado de casos respecto al año anterior.",
    domain: "epidemiological",
  },
  {
    id: 17,
    name: "Variación promedio vs. años anteriores",
    description: "Variación porcentual semanal frente al promedio semanal de los últimos 5 años.",
    domain: "epidemiological",
  },
  {
    id: 18,
    name: "Tipo de brote",
    description: "Clasificación del comportamiento de casos en últimas semanas: Tipo I: al menos 3 de las últimas 5 semanas con aumento; Tipo II: al menos 6 semanas con tendencia creciente.",
    domain: "epidemiological",
  },
  {
    id: 19,
    name: "Porcentaje de hospitalización por dengue",
    description: "Porcentaje de casos de dengue que requieren hospitalización.",
    domain: "epidemiological",
  },
  {
    id: 20,
    name: "Edad (moda, mediana, promedio) de hospitalización",
    description: "Estadísticas de edad para casos hospitalizados.",
    domain: "epidemiological",
  },
  {
    id: 21,
    name: "Porcentaje de hospitalización por tipo",
    description: "Proporción de hospitalizaciones por tipo clínico sobre el total de casos.",
    domain: "epidemiological",
  },
  {
    id: 22,
    name: "Casos según clasificación clínica",
    description: "Distribución por clasificación: Grave; Con signos de alarma; Sin signos de alarma.",
    domain: "epidemiological",
  },
  {
    id: 23,
    name: "% de casos confirmados por laboratorio",
    description: "Porcentaje de casos con confirmación de laboratorio.",
    domain: "epidemiological",
  },
  {
    id: 24,
    name: "Letalidad",
    description: "Número de muertes probables por dengue / total de casos (porcentaje).",
    domain: "epidemiological",
  },
  {
    id: 25,
    name: "Muertes probables",
    description: "Conteo de muertes probables por dengue en el periodo.",
    domain: "epidemiological",
  },
  {
    id: 26,
    name: "Tiempo entre síntoma y consulta",
    description: "Días promedio entre fecha de inicio de síntomas y la consulta.",
    domain: "epidemiological",
  },
  {
    id: 27,
    name: "Tiempo entre consulta y notificación",
    description: "Días promedio entre fecha de consulta y la notificación al sistema.",
    domain: "epidemiological",
  },
  {
    id: 28,
    name: "Inicio y mantenimiento de brote histórico",
    description: "Identificación del barrio o zona que inició y mantiene el brote.",
    domain: "epidemiological",
  },
  {
    id: 29,
    name: "Serotipos circulantes",
    description: "Frecuencia de cada serotipo sobre el total de muestras positivas.",
    domain: "epidemiological",
  },
  {
    id: 30,
    name: "Tiempo de notificación y confirmación de casos",
    description: "Días transcurridos entre la aparición del caso y su notificación/confirmación en el sistema.",
    domain: "epidemiological",
  },
  {
    id: 31,
    name: "Número de organizaciones sociales",
    description: "Número de organizaciones comunitarias o sociales involucradas en salud en la zona.",
    domain: "social",
  },
  {
    id: 32,
    name: "Índice de Vulnerabilidad Socioeconómica",
    description: "Índice compuesto que incluye pobreza, hacinamiento, nivel educativo, etc.",
    domain: "social",
  },
  {
    id: 33,
    name: "Densidad poblacional",
    description: "Habitantes por unidad de superficie (por barrio/comuna).",
    domain: "social",
  },
  {
    id: 34,
    name: "Percepción de riesgo comunitario",
    description: "Resultado de encuestas o reportes cualitativos sobre percepción del riesgo.",
    domain: "social",
  },
  {
    id: 35,
    name: "Cobertura de educación preventiva",
    description: "Población alcanzada por campañas educativas (porcentaje o número).",
    domain: "social",
  },
  {
    id: 36,
    name: "Prácticas preventivas",
    description: "Medidas de promoción y adopción de prácticas de prevención y control en hogares.",
    domain: "social",
  },
  {
    id: 37,
    name: "Inspección y control de sumideros",
    description: "Número de sumideros controlados / número de sumideros inspeccionados.",
    domain: "control",
  },
  {
    id: 38,
    name: "Inspección y control en viviendas",
    description: "Número de viviendas intervenidas / número de viviendas inspeccionadas.",
    domain: "control",
  },
  {
    id: 39,
    name: "Inspección y control en lugares de concentración humana",
    description: "Número de lugares de concentración controlados / inspeccionados (mercados, escuelas, etc.).",
    domain: "control",
  },
  {
    id: 40,
    name: "Cobertura en instituciones educativas",
    description: "Instituciones inspeccionadas / total de instituciones.",
    domain: "control",
  },
  {
    id: 41,
    name: "Inspección y control en cuerpos de agua (control biológico)",
    description: "Número de siembras o re-siembras de peces / número de depósitos inspeccionados.",
    domain: "control",
  },
  {
    id: 42,
    name: "Sector económico",
    description: "Sector económico predominante en la zona (puede influir en riesgo y respuesta).",
    domain: "environmental",
  },
  {
    id: 43,
    name: "Cobertura de agua potable",
    description: "% de población con acceso a agua potable.",
    domain: "environmental",
  },
  {
    id: 44,
    name: "Continuidad en el servicio de acueducto",
    description: "Medida de continuidad/fiabilidad del suministro de agua.",
    domain: "environmental",
  },
  {
    id: 45,
    name: "Rechazo comunitario a intervención",
    description: "Número de viviendas renuentes / viviendas a inspeccionar.",
    domain: "social",
  },
  {
    id: 46,
    name: "Presencia de basureros ilegales o puntos críticos de residuos",
    description: "Presencia de acumulación de residuos que pueden actuar como criaderos.",
    domain: "environmental",
  },
  {
    id: 47,
    name: "Estado de canales de aguas lluvias (limpios / obstruidos)",
    description: "Condición física y operativa de canales pluviales urbanos.",
    domain: "environmental",
  },
  {
    id: 48,
    name: "Estado de sumideros (limpios / obstruidos)",
    description: "Condición física y operativa de sumideros urbanos.",
    domain: "environmental",
  },
  {
    id: 49,
    name: "Cobertura de zonas verdes y árboles por barrio",
    description: "% del área del barrio con cobertura vegetal significativa.",
    domain: "environmental",
  },
  {
    id: 50,
    name: "Frecuencia de recolección de residuos sólidos",
    description: "Número de veces por semana que se recoge la basura.",
    domain: "environmental",
  },
  {
    id: 51,
    name: "Índice de pluviosidad (días previos)",
    description: "Registro de lluvia en días previos; evalúa impacto en adherencia de aspersión química, viento y humedad.",
    domain: "climatic",
  },
  {
    id: 52,
    name: "Temperatura máxima (días previos)",
    description: "Temperatura máxima de días previos; influencia en evaporación y eficacia de aspersión química.",
    domain: "climatic",
  },
  {
    id: 53,
    name: "Disponibilidad de equipos",
    description: "Inventario de equipos disponibles para control vectorial.",
    domain: "operational",
  },
  {
    id: 54,
    name: "Personal en terreno",
    description: "Número de personas necesarias/ disponibles para intervenciones en terreno.",
    domain: "operational",
  },
  {
    id: 55,
    name: "Disponibilidad de insumos",
    description: "Inventario de insumos (insecticidas, equipos de protección, repuestos, etc.).",
    domain: "operational",
  },
  {
    id: 56,
    name: "Tiempo de respuesta de control vectorial desde la notificación",
    description: "Días entre la notificación de un caso y la ejecución de la primera acción de control vectorial en la zona.",
    domain: "operational",
  },
  {
    id: 57,
    name: "Cobertura de eliminación de criaderos o control químico en zonas de brote",
    description: "Proporción de viviendas intervenidas respecto al total en el área del brote.",
    domain: "operational",
  },
  {
    id: 58,
    name: "Tiempo de alistamiento de brigadas",
    description: "Días promedio desde alerta hasta intervención por brigada.",
    domain: "operational",
  },
  {
    id: 59,
    name: "Tiempo promedio de ejecución",
    description: "Días promedio para ejecutar la intervención por barrio.",
    domain: "operational",
  },
  {
    id: 60,
    name: "Cobertura territorial por brigada",
    description: "Número de barrios o viviendas cubiertas por día por una brigada.",
    domain: "operational",
  },
  {
    id: 61,
    name: "Costos unitarios por intervención",
    description: "Costo en USD por acción (fumigación, control larvario, campañas, etc.).",
    domain: "operational",
  },
  {
    id: 62,
    name: "Disponibilidad logística semanal",
    description: "Número de brigadas, equipos o insumos disponibles por semana.",
    domain: "operational",
  },
  {
    id: 63,
    name: "Capacidad máxima por comuna",
    description: "Límite operativo estimado por zona (máxima capacidad de respuesta).",
    domain: "operational",
  },
  {
    id: 64,
    name: "Probabilidad de reducción de casos",
    description: "% estimado de casos evitados en 2–3 semanas tras intervención.",
    domain: "impact",
  },
  {
    id: 65,
    name: "Reducción de índice de Breteau tras control larvario",
    description: "Delta (cambio) esperado en IB post intervención.",
    domain: "impact",
  },
  {
    id: 66,
    name: "Retención de aprendizaje comunitario",
    description: "% de hogares que mantienen prácticas preventivas después de 1 mes.",
    domain: "impact",
  },
  {
    id: 67,
    name: "Tasa de reinfestación",
    description: "Tiempo estimado hasta reaparición de foco tras intervención.",
    domain: "impact",
  },
  {
    id: 68,
    name: "Disponibilidad de camas hospitalarias/UCI para dengue grave",
    description: "Número y proporción de camas disponibles para manejo de dengue grave durante un brote.",
    domain: "healthcare",
  },
  {
    id: 69,
    name: "Cobertura de hogares alcanzados con mensajes de riesgo",
    description: "% de hogares en la zona del brote que recibieron comunicación educativa sobre dengue.",
    domain: "social",
  },
];

const strategies = [
  {
    metodo: "Manejo de escorrentías o acumulaciones de agua por lluvias; Monitoreo y control según condiciones climáticas.",
    objetivo: "Ajustar acciones preventivas según pronósticos y condiciones. Evitar acumulación de agua por mala gestión pluvial.",
    codigo: "Ambiental / Clima",
    order: 1,
    associatedIndicators: [1, 2, 3, 4, 5, 7, 8, 9, 10, 43, 44, 45, 47, 48, 51, 52, 69],
  },
  {
    metodo: "Campañas educativas y de comunicación comunitaria; Concientización sobre percepciones de riesgo (PQRs); Control de recipientes decorativos con agua (floreros).",
    objetivo: "Aumentar percepción de riesgo y fomentar acciones preventivas. Eliminar focos de criaderos en inmuebles sin uso. Evitar acumulación de agua en estructuras ornamentales.",
    codigo: "Ambiental / Comunitario / Cultural",
    order: 2,
    associatedIndicators: [1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 31, 32, 34, 35, 36, 38, 39, 40, 42, 43, 44, 45, 48, 51, 52, 53, 54, 55, 58, 59, 60, 61, 62, 63, 64, 65, 66, 69],
  },
  {
    metodo: "Asegurar financiamiento para el programa de control del dengue; Implementar programas de salud ocupacional y control vectorial en empresas; Inversión en construcción de infraestructura para control y mitigación.",
    objetivo: "Contar con instalaciones adecuadas para la gestión y control del vector. Garantizar recursos económicos. Involucrar al sector privado.",
    codigo: "Ambiental / Económico",
    order: 3,
    associatedIndicators: [9, 10, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 31, 33, 34, 35, 36, 39, 42, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 66],
  },
  {
    metodo: "Almacenamiento seguro de agua; control de estanques; corte de césped.",
    objetivo: "Eliminar agua acumulada en plantas. Eliminar microcriaderos estructurales. Evitar acumulación de basura que sirva de criadero.",
    codigo: "Ambiental / Control físico",
    order: 4,
    associatedIndicators: [1, 3, 4, 8, 9, 10, 11, 32, 34, 35, 36, 37, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 58, 59, 60, 61, 62, 63, 64, 65, 66, 69],
  },
  {
    metodo: "Aprobación Consejo Plan de Contingencia; Cambio de Gobierno; Coordinación interinstitucional para servicios básicos.",
    objetivo: "Asegurar continuidad de medidas preventivas y correctivas. Eliminar criaderos en acumulaciones de basura y desechos. Evitar acumulación de agua en infraestructuras deportivas.",
    codigo: "Ambiental / Político",
    order: 5,
    associatedIndicators: [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 34, 35, 36, 39, 40, 42, 43, 44, 45, 46, 48, 49, 50, 51, 53, 54, 55, 58, 59, 60, 61, 62, 63, 64, 66, 68, 69],
  },
  {
    metodo: "Cambio y lavado frecuente de recipientes de agua; Campañas educativas para sensibilización comunitaria; Ingreso de brigadas a las viviendas para intervenciones.",
    objetivo: "Evitar acumulación de agua en macetas y otros recipientes. Fomentar prácticas preventivas sostenibles. Interrumpir ciclo del mosquito.",
    codigo: "Ambiental / Social",
    order: 6,
    associatedIndicators: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 31, 34, 35, 36, 37, 38, 39, 40, 42, 43, 44, 45, 51, 52, 53, 54, 55, 58, 59, 60, 61, 62, 63, 64, 65, 66, 69],
  },
  {
    metodo: "Evitar contacto con el vector; Protección individual en contextos de alto riesgo; Uso de repelente.",
    objetivo: "Brindar protección a personas en zonas de alta transmisión. Evitar exposición durante el descanso. Minimizar contacto con mosquitos.",
    codigo: "Contacto / Protección individual",
    order: 7,
    associatedIndicators: [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 31, 32, 33, 34, 35, 36, 40, 45, 55, 61, 64, 66],
  },
  {
    metodo: "Hacer programas de Diagnóstico de casos (Dx) de dengue; Tratamiento (Rx) de personas infectadas y manejo de la convivencia con reservorios.",
    objetivo: "Disminuir la carga viral comunitaria. Reducir transmisión al identificar rápidamente a infectados.",
    codigo: "Reservorio / Reservorios humanos",
    order: 8,
    associatedIndicators: [11, 13, 16, 20, 22, 23, 24, 25, 26, 27, 29, 32, 33, 34, 35, 45, 54, 55, 56, 58, 60, 61, 62, 63, 64, 68],
  },
  {
    metodo: "Vacuna; quimioprofilaxis.",
    objetivo: "Reducir la susceptibilidad humana a la infección por dengue.",
    codigo: "Susceptible / Prevención en el Huésped",
    order: 9,
    associatedIndicators: [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 32, 33, 45, 53, 54, 55, 60, 61, 62, 63, 64, 68],
  },
  {
    metodo: "Bti; guppies; copépodos.",
    objetivo: "Controlar la proliferación larvaria en depósitos de agua mediante métodos biológicos.",
    codigo: "Vector / Biológico / Larvas",
    order: 10,
    associatedIndicators: [1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 13, 15, 16, 18, 37, 38, 39, 41, 53, 54, 55],
  },
  {
    metodo: "Wolbachia; mosquitos genéticamente modificados.",
    objetivo: "Reducir la capacidad vectorial del Aedes aegypti mediante alteraciones biológicas sostenibles.",
    codigo: "Vector / Biológico / Adultos",
    order: 11,
    associatedIndicators: [6, 7, 8, 9, 11, 28, 29, 32, 33, 45, 52, 53, 54, 55, 56],
  },
  {
    metodo: "Angeo; ovitrampas; Uso de herramientas o programas como 'Vector-cam' para monitoreo, que puedan disparar control vectorial.",
    objetivo: "Reducir población de mosquitos adultos. Implementar control vectorial innovador y focalizado.",
    codigo: "Vector / Control físico / Adultos",
    order: 12,
    associatedIndicators: [5, 6, 7, 8, 9, 19, 21, 22, 24, 25, 33, 34, 53, 54],
  },
  {
    metodo: "Identificación de criaderos; uso de Vector-cam.",
    objetivo: "Interrumpir el ciclo de vida larvario mediante vigilancia focalizada.",
    codigo: "Vector / Control físico / Larvas",
    order: 13,
    associatedIndicators: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 15, 16, 17, 18, 36, 38, 40, 42, 43, 44, 45, 59, 60, 61, 62, 64],
  },
  {
    metodo: "Adulticidas químicos (malatión, deltametrina).",
    objetivo: "Disminuir la población de mosquitos adultos en brotes.",
    codigo: "Vector / Control químico / Adultos",
    order: 14,
    associatedIndicators: [1, 2, 5, 6, 7, 8, 10, 11, 12, 16, 17, 18, 19, 25, 34, 45, 53, 54, 55, 56, 57, 58, 59, 60, 61, 64, 67],
  },
  {
    metodo: "Larvicidas químicos en criaderos específicos.",
    objetivo: "Reducir la supervivencia larvaria en depósitos de gran volumen.",
    codigo: "Vector / Control químico / Larvas",
    order: 15,
    associatedIndicators: [8, 37, 48, 51, 52, 53, 54, 55, 61, 62],
  },
  {
    metodo: "Uso de datos meteorológicos y modelos de alerta temprana.",
    objetivo: "Anticipar picos de transmisión y orientar la respuesta.",
    codigo: "Vigilancia / Predicción / Clima",
    order: 16,
    associatedIndicators: [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 34, 35, 36, 62, 66, 69],
  },
  {
    metodo: "Difusión de mensajes inmediatos en SMS, redes sociales, radios comunitarias.",
    objetivo: "Acelerar la adopción de medidas preventivas en barrios afectados.",
    codigo: "Comunicación de riesgo / Comunitario",
    order: 17,
    associatedIndicators: [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 34, 35, 36, 62, 66, 69],
  },
  {
    metodo: "Implementación rápida de protocolos de triage y capacitación del personal de salud.",
    objetivo: "Optimizar atención de casos graves y reducir mortalidad.",
    codigo: "Gestión clínica / Institucional",
    order: 18,
    associatedIndicators: [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 68],
  },
  {
    metodo: "Articulación con sectores de agua, saneamiento, educación y servicios públicos.",
    objetivo: "Ampliar impacto y sostenibilidad de acciones de control vectorial.",
    codigo: "Coordinación / Intersectorial",
    order: 19,
    associatedIndicators: [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 32, 34, 40, 42, 43, 44, 46, 47, 48, 49, 50, 53, 54, 55, 58, 59, 62, 63],
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Create indicators
  console.log("📊 Creating 69 indicators...");
  for (const indicator of indicators) {
    await prisma.indicator.upsert({
      where: { id: indicator.id.toString() },
      update: {
        name: indicator.name,
        description: indicator.description,
        domain: indicator.domain,
      },
      create: {
        id: indicator.id.toString(),
        name: indicator.name,
        description: indicator.description,
        domain: indicator.domain,
        active: true,
      },
    });
  }
  console.log(`✅ Created ${indicators.length} indicators`);

  // Create survey
  console.log("📋 Creating survey...");
  const survey = await prisma.survey.upsert({
    where: { id: "survey-dengue-2025" },
    update: {
      title: "Encuesta de Ponderación de Indicadores para Estrategias de Mitigación del Dengue 2025",
      version: "1.0",
      active: true,
    },
    create: {
      id: "survey-dengue-2025",
      title: "Encuesta de Ponderación de Indicadores para Estrategias de Mitigación del Dengue 2025",
      version: "1.0",
      active: true,
    },
  });
  console.log(`✅ Created survey: ${survey.title}`);

  // Create strategies
  console.log("🎯 Creating 19 strategies...");
  for (const strategy of strategies) {
    await prisma.strategy.upsert({
      where: {
        surveyId_order: {
          surveyId: survey.id,
          order: strategy.order,
        },
      },
      update: {
        metodo: strategy.metodo,
        objetivo: strategy.objetivo,
        codigo: strategy.codigo,
        associatedIndicators: strategy.associatedIndicators,
      } as any,
      create: {
        surveyId: survey.id,
        metodo: strategy.metodo,
        objetivo: strategy.objetivo,
        codigo: strategy.codigo,
        order: strategy.order,
        active: true,
        associatedIndicators: strategy.associatedIndicators,
      } as any,
    });
  }
  console.log(`✅ Created ${strategies.length} strategies`);

  // Create test respondents and tokens (expires in 30 days)
  console.log("👥 Creating test respondents and tokens...");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const testUsers = [
    {
      name: "Ana García Rodríguez",
      email: "ana.garcia@example.com",
    },
    {
      name: "Carlos Mendoza López",
      email: "carlos.mendoza@example.com",
    },
    {
      name: "María Torres Silva",
      email: "maria.torres@example.com",
    },
  ];

  for (const user of testUsers) {
    // Try to find existing respondent by email
    let respondent = await prisma.respondent.findFirst({
      where: { email: user.email },
    });

    // Create if doesn't exist
    if (!respondent) {
      respondent = await prisma.respondent.create({
        data: {
          name: user.name,
          email: user.email,
          role: null,
        } as any,
      });
    }

    // Generate a unique token (using timestamp + random)
    const token = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Create invite token
    await prisma.respondentInvite.create({
      data: {
        token,
        surveyId: survey.id,
        respondentId: respondent.id,
        expiresAt,
        status: "pending",
      },
    });

    console.log(`  → ${user.name}`);
    console.log(`     Email: ${user.email}`);
  }
  console.log(`✅ Created ${testUsers.length} respondents and tokens`);

  console.log("\n✨ Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
