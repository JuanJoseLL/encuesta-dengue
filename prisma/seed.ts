import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const indicators = [
  {
    name: "Índice de Breteau (IB)",
    description: "Número de criaderos positivos por 100 viviendas inspeccionadas.",
    domain: "entomological",
  },
  {
    name: "Índice de vivienda (IV)",
    description: "Porcentaje de viviendas con al menos un criadero positivo.",
    domain: "entomological",
  },
  {
    name: "Índice de depósito (ID)",
    description: "Porcentaje de depósitos positivos sobre el total inspeccionado.",
    domain: "entomological",
  },
  {
    name: "Tipo de depósito positivo dominante",
    description: "Tipo de recipiente o depósito más frecuentemente positivo (ej. botellas, neumáticos, tanques).",
    domain: "entomological",
  },
  {
    name: "Índice pupal",
    description: "Número de pupas por persona (estimación de la densidad de preimaginales).",
    domain: "entomological",
  },
  {
    name: "Número de ovitrampas positivas",
    description: "Conteo semanal de ovitrampas positivas por barrio.",
    domain: "entomological",
  },
  {
    name: "Nivel de infestación crítica",
    description: "Zonas con IB > umbral establecido (ej. IB > 20) u otro umbral definido localmente.",
    domain: "entomological",
  },
  {
    name: "Índice Aédico en sumidero",
    description: "Porcentaje de sumideros con presencia de larvas de Aedes.",
    domain: "entomological",
  },
  {
    name: "Índice de predio en concentraciones humanas",
    description: "% de predios en lugares de concentración humana con al menos un criadero positivo.",
    domain: "entomological",
  },
  {
    name: "Índice de depósito en concentraciones humanas",
    description: "% de depósitos positivos sobre el total inspeccionado en concentraciones humanas.",
    domain: "entomological",
  },
  {
    name: "Establecimiento de Wolbachia",
    description: "% de mosquitos Aedes positivos para Wolbachia (indicar sexo si es relevante).",
    domain: "entomological",
  },
  {
    name: "Número de casos por semana epidemiológica",
    description: "Número de casos reportados por cada semana epidemiológica.",
    domain: "epidemiological",
  },
  {
    name: "Tasa de incidencia semanal",
    description: "Casos nuevos por 100.000 habitantes en la semana.",
    domain: "epidemiological",
  },
  {
    name: "Zona del canal endémico (situación)",
    description: "Clasificación de la zona según la situación semanal de notificación (p. ej. endémico, epidémico, control).",
    domain: "epidemiological",
  },
  {
    name: "Razón de crecimiento epidémico frente al año anterior",
    description: "Cambio porcentual de casos respecto al mismo periodo del año anterior.",
    domain: "epidemiological",
  },
  {
    name: "Variación porcentual",
    description: "Cambio porcentual del número acumulado de casos respecto al año anterior.",
    domain: "epidemiological",
  },
  {
    name: "Variación promedio vs. años anteriores",
    description: "Variación porcentual semanal frente al promedio semanal de los últimos 5 años.",
    domain: "epidemiological",
  },
  {
    name: "Tipo de brote",
    description: "Clasificación del comportamiento de casos en últimas semanas: Tipo I: al menos 3 de las últimas 5 semanas con aumento; Tipo II: al menos 6 semanas con tendencia creciente.",
    domain: "epidemiological",
  },
  {
    name: "Porcentaje de hospitalización por dengue",
    description: "Porcentaje de casos de dengue que requieren hospitalización.",
    domain: "epidemiological",
  },
  {
    name: "Edad (moda, mediana, promedio) de hospitalización",
    description: "Estadísticas de edad para casos hospitalizados.",
    domain: "epidemiological",
  },
  {
    name: "Porcentaje de hospitalización por tipo",
    description: "Proporción de hospitalizaciones por tipo clínico sobre el total de casos.",
    domain: "epidemiological",
  },
  {
    name: "Casos según clasificación clínica",
    description: "Distribución por clasificación: Grave; Con signos de alarma; Sin signos de alarma.",
    domain: "epidemiological",
  },
  {
    name: "% de casos confirmados por laboratorio",
    description: "Porcentaje de casos con confirmación de laboratorio.",
    domain: "epidemiological",
  },
  {
    name: "Letalidad",
    description: "Número de muertes probables por dengue / total de casos (porcentaje).",
    domain: "epidemiological",
  },
  {
    name: "Muertes probables",
    description: "Conteo de muertes probables por dengue en el periodo.",
    domain: "epidemiological",
  },
  {
    name: "Tiempo entre síntoma y consulta",
    description: "Días promedio entre fecha de inicio de síntomas y la consulta.",
    domain: "epidemiological",
  },
  {
    name: "Tiempo entre consulta y notificación",
    description: "Días promedio entre fecha de consulta y la notificación al sistema.",
    domain: "epidemiological",
  },
  {
    name: "Inicio y mantenimiento de brote histórico",
    description: "Identificación del barrio o zona que inició y mantiene el brote.",
    domain: "epidemiological",
  },
  {
    name: "Serotipos circulantes",
    description: "Frecuencia de cada serotipo sobre el total de muestras positivas.",
    domain: "epidemiological",
  },
  {
    name: "Tiempo de notificación y confirmación de casos",
    description: "Días transcurridos entre la aparición del caso y su notificación/confirmación en el sistema.",
    domain: "epidemiological",
  },
  {
    name: "Número de organizaciones sociales",
    description: "Número de organizaciones comunitarias o sociales involucradas en salud en la zona.",
    domain: "social",
  },
  {
    name: "Índice de Vulnerabilidad Socioeconómica",
    description: "Índice compuesto que incluye pobreza, hacinamiento, nivel educativo, etc.",
    domain: "social",
  },
  {
    name: "Densidad poblacional",
    description: "Habitantes por unidad de superficie (por barrio/comuna).",
    domain: "social",
  },
  {
    name: "Percepción de riesgo comunitario",
    description: "Resultado de encuestas o reportes cualitativos sobre percepción del riesgo.",
    domain: "social",
  },
  {
    name: "Cobertura de educación preventiva",
    description: "Población alcanzada por campañas educativas (porcentaje o número).",
    domain: "social",
  },
  {
    name: "Prácticas preventivas",
    description: "Medidas de promoción y adopción de prácticas de prevención y control en hogares.",
    domain: "social",
  },
  {
    name: "Inspección y control de sumideros",
    description: "Número de sumideros controlados / número de sumideros inspeccionados.",
    domain: "control",
  },
  {
    name: "Inspección y control en viviendas",
    description: "Número de viviendas intervenidas / número de viviendas inspeccionadas.",
    domain: "control",
  },
  {
    name: "Inspección y control en lugares de concentración humana",
    description: "Número de lugares de concentración controlados / inspeccionados (mercados, escuelas, etc.).",
    domain: "control",
  },
  {
    name: "Cobertura en instituciones educativas",
    description: "Instituciones inspeccionadas / total de instituciones.",
    domain: "control",
  },
  {
    name: "Inspección y control en cuerpos de agua (control biológico)",
    description: "Número de siembras o re-siembras de peces / número de depósitos inspeccionados.",
    domain: "control",
  },
  {
    name: "Sector económico",
    description: "Sector económico predominante en la zona (puede influir en riesgo y respuesta).",
    domain: "environmental",
  },
  {
    name: "Cobertura de agua potable",
    description: "% de población con acceso a agua potable.",
    domain: "environmental",
  },
  {
    name: "Continuidad en el servicio de acueducto",
    description: "Medida de continuidad/fiabilidad del suministro de agua.",
    domain: "environmental",
  },
  {
    name: "Rechazo comunitario a intervención",
    description: "Número de viviendas renuentes / viviendas a inspeccionar.",
    domain: "social",
  },
  {
    name: "Presencia de basureros ilegales o puntos críticos de residuos",
    description: "Presencia de acumulación de residuos que pueden actuar como criaderos.",
    domain: "environmental",
  },
  {
    name: "Estado de canales de aguas lluvias (limpios / obstruidos)",
    description: "Condición física y operativa de canales pluviales urbanos.",
    domain: "environmental",
  },
  {
    name: "Estado de sumideros (limpios / obstruidos)",
    description: "Condición física y operativa de sumideros urbanos.",
    domain: "environmental",
  },
  {
    name: "Cobertura de zonas verdes y árboles por barrio",
    description: "% del área del barrio con cobertura vegetal significativa.",
    domain: "environmental",
  },
  {
    name: "Frecuencia de recolección de residuos sólidos",
    description: "Número de veces por semana que se recoge la basura.",
    domain: "environmental",
  },
  {
    name: "Índice de pluviosidad (días previos)",
    description: "Registro de lluvia en días previos; evalúa impacto en adherencia de aspersión química, viento y humedad.",
    domain: "climatic",
  },
  {
    name: "Temperatura máxima (días previos)",
    description: "Temperatura máxima de días previos; influencia en evaporación y eficacia de aspersión química.",
    domain: "climatic",
  },
  {
    name: "Disponibilidad de equipos",
    description: "Inventario de equipos disponibles para control vectorial.",
    domain: "operational",
  },
  {
    name: "Personal en terreno",
    description: "Número de personas necesarias/ disponibles para intervenciones en terreno.",
    domain: "operational",
  },
  {
    name: "Disponibilidad de insumos",
    description: "Inventario de insumos (insecticidas, equipos de protección, repuestos, etc.).",
    domain: "operational",
  },
  {
    name: "Tiempo de respuesta de control vectorial desde la notificación",
    description: "Días entre la notificación de un caso y la ejecución de la primera acción de control vectorial en la zona.",
    domain: "operational",
  },
  {
    name: "Cobertura de eliminación de criaderos o control químico en zonas de brote",
    description: "Proporción de viviendas intervenidas respecto al total en el área del brote.",
    domain: "operational",
  },
  {
    name: "Tiempo de alistamiento de brigadas",
    description: "Días promedio desde alerta hasta intervención por brigada.",
    domain: "operational",
  },
  {
    name: "Tiempo promedio de ejecución",
    description: "Días promedio para ejecutar la intervención por barrio.",
    domain: "operational",
  },
  {
    name: "Cobertura territorial por brigada",
    description: "Número de barrios o viviendas cubiertas por día por una brigada.",
    domain: "operational",
  },
  {
    name: "Costos unitarios por intervención",
    description: "Costo en USD por acción (fumigación, control larvario, campañas, etc.).",
    domain: "operational",
  },
  {
    name: "Disponibilidad logística semanal",
    description: "Número de brigadas, equipos o insumos disponibles por semana.",
    domain: "operational",
  },
  {
    name: "Capacidad máxima por comuna",
    description: "Límite operativo estimado por zona (máxima capacidad de respuesta).",
    domain: "operational",
  },
  {
    name: "Probabilidad de reducción de casos",
    description: "% estimado de casos evitados en 2–3 semanas tras intervención.",
    domain: "impact",
  },
  {
    name: "Reducción de índice de Breteau tras control larvario",
    description: "Delta (cambio) esperado en IB post intervención.",
    domain: "impact",
  },
  {
    name: "Retención de aprendizaje comunitario",
    description: "% de hogares que mantienen prácticas preventivas después de 1 mes.",
    domain: "impact",
  },
  {
    name: "Tasa de reinfestación",
    description: "Tiempo estimado hasta reaparición de foco tras intervención.",
    domain: "impact",
  },
  {
    name: "Disponibilidad de camas hospitalarias/UCI para dengue grave",
    description: "Número y proporción de camas disponibles para manejo de dengue grave durante un brote.",
    domain: "healthcare",
  },
  {
    name: "Cobertura de hogares alcanzados con mensajes de riesgo",
    description: "% de hogares en la zona del brote que recibieron comunicación educativa sobre dengue.",
    domain: "social",
  },
];

const strategies = [
  {
    title: "Ambiental - Ambiental / Clima",
    description: "Método: Manejo de escorrentías o acumulaciones de agua por lluvias; Monitoreo y control según condiciones climáticas. | Objetivo: Ajustar acciones preventivas según pronósticos y condiciones. Evitar acumulación de agua por mala gestión pluvial.",
    order: 1,
  },
  {
    title: "Ambiental - Comunitario / Cultural",
    description: "Método: Campañas educativas y de comunicación comunitaria; Concientización sobre percepciones de riesgo (PQRs); Control de recipientes decorativos con agua (floreros). | Objetivo: Aumentar percepción de riesgo y fomentar acciones preventivas. Eliminar focos de criaderos en inmuebles sin uso. Evitar acumulación de agua en estructuras ornamentales.",
    order: 2,
  },
  {
    title: "Ambiental - Económico",
    description: "Método: Asegurar financiamiento para el programa de control del dengue; Programas de salud ocupacional y control vectorial en empresas; Inversión en infraestructura. | Objetivo: Contar con instalaciones adecuadas para la gestión y control del vector. Garantizar recursos económicos. Involucrar al sector privado.",
    order: 3,
  },
  {
    title: "Ambiental - Control físico",
    description: "Método: Almacenamiento seguro de agua; control de estanques; corte de césped. | Objetivo: Eliminar agua acumulada en plantas. Eliminar microcriaderos estructurales. Evitar acumulación de basura que sirva de criadero.",
    order: 4,
  },
  {
    title: "Ambiental - Político",
    description: "Método: Aprobación Consejo Plan de Contingencia; Cambio de Gobierno; Coordinación interinstitucional. | Objetivo: Asegurar continuidad de medidas preventivas y correctivas. Eliminar criaderos en acumulaciones de basura y desechos. Evitar acumulación de agua en infraestructuras deportivas.",
    order: 5,
  },
  {
    title: "Ambiental - Social",
    description: "Método: Cambio y lavado frecuente de recipientes de agua; Campañas educativas; Ingreso de brigadas a viviendas. | Objetivo: Evitar acumulación de agua en macetas y otros recipientes. Fomentar prácticas preventivas sostenibles. Interrumpir ciclo del mosquito.",
    order: 6,
  },
  {
    title: "Contacto - Protección individual",
    description: "Método: Evitar contacto con el vector; Protección en contextos de alto riesgo; Uso de repelente. | Objetivo: Brindar protección a personas en zonas de alta transmisión. Evitar exposición durante el descanso. Minimizar contacto con mosquitos.",
    order: 7,
  },
  {
    title: "Reservorio - Reservorios humanos",
    description: "Método: Programas de diagnóstico (Dx); Tratamiento (Rx) de personas infectadas. | Objetivo: Disminuir la carga viral comunitaria. Reducir transmisión al identificar rápidamente a infectados.",
    order: 8,
  },
  {
    title: "Susceptible - Susceptibles / Prevención en el Huésped",
    description: "Método: Vacuna; quimioprofilaxis. | Objetivo: Reducir la susceptibilidad humana a la infección por dengue.",
    order: 9,
  },
  {
    title: "Vector - Biológico - Larvas",
    description: "Método: Bti; guppies; copépodos. | Objetivo: Controlar la proliferación larvaria en depósitos de agua mediante métodos biológicos.",
    order: 10,
  },
  {
    title: "Vector - Biológico - Adultos",
    description: "Método: Wolbachia; mosquitos genéticamente modificados. | Objetivo: Reducir la capacidad vectorial del Aedes aegypti mediante alteraciones biológicas sostenibles.",
    order: 11,
  },
  {
    title: "Vector - Control físico - Adultos",
    description: "Método: Angeo; ovitrampas; Uso de 'Vector-cam'. | Objetivo: Reducir población de mosquitos adultos. Implementar control vectorial innovador y focalizado.",
    order: 12,
  },
  {
    title: "Vector - Control físico - Larvas",
    description: "Método: Identificación de criaderos; uso de Vector-cam. | Objetivo: Interrumpir el ciclo de vida larvario mediante vigilancia focalizada.",
    order: 13,
  },
  {
    title: "Vector - Control químico - Adultos",
    description: "Método: Adulticidas químicos (malatión, deltametrina). | Objetivo: Disminuir la población de mosquitos adultos en brotes.",
    order: 14,
  },
  {
    title: "Vector - Control químico - Larvas",
    description: "Método: Larvicidas químicos en criaderos específicos. | Objetivo: Reducir la supervivencia larvaria en depósitos de gran volumen.",
    order: 15,
  },
  {
    title: "Vigilancia entomológica y epidemiológica - Predicción / Clima",
    description: "Método: Uso de datos meteorológicos y modelos de alerta temprana. | Objetivo: Anticipar picos de transmisión y orientar la respuesta.",
    order: 16,
  },
  {
    title: "Comunicación de riesgo - Comunitario / Comunicación",
    description: "Método: Difusión de mensajes por SMS, redes sociales, radios comunitarias. | Objetivo: Acelerar la adopción de medidas preventivas en barrios afectados.",
    order: 17,
  },
  {
    title: "Gestión clínica en brotes - Clínico / Institucional",
    description: "Método: Protocolos de triage y capacitación del personal de salud. | Objetivo: Optimizar atención de casos graves y reducir mortalidad.",
    order: 18,
  },
  {
    title: "Coordinación intersectorial operativa - Institucional / Intersectorial",
    description: "Método: Articulación con sectores de agua, saneamiento, educación y servicios públicos. | Objetivo: Ampliar impacto y sostenibilidad de acciones de control vectorial.",
    order: 19,
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Create indicators
  console.log("📊 Creating 69 indicators...");
  for (const indicator of indicators) {
    await prisma.indicator.upsert({
      where: { name: indicator.name },
      update: indicator,
      create: indicator,
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
        title: strategy.title,
        description: strategy.description,
      },
      create: {
        surveyId: survey.id,
        title: strategy.title,
        description: strategy.description,
        order: strategy.order,
        active: true,
      },
    });
  }
  console.log(`✅ Created ${strategies.length} strategies`);

  // Create test tokens (expires in 10 days)
  console.log("🔑 Creating test tokens...");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 10);

  const testUsersID = [
    "123456789",
    "987654321",
    "111111111",
    "1077841023",
    "123123123",
    "321321321",
  ];
  const testRoles = [
    "epidemiologist",
    "entomologist",
    "biologist",
    "health-authority",
    "researcher",
    "other",
  ];

  for (let i = 0; i < testUsersID.length; i++) {
    const role = testRoles[i];
    const token = testUsersID[i];

    await prisma.respondentInvite.upsert({
      where: { token },
      update: {
        surveyId: survey.id,
        expiresAt,
        status: "pending",
      },
      create: {
        token,
        surveyId: survey.id,
        expiresAt,
        status: "pending",
      },
    });
  }
  console.log(`✅ Created ${testUsersID.length} tokens`);

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
