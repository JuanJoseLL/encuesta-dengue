import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const indicators = [
  {
    name: "Índice de Breteau (IB)",
    description: "Número de criaderos positivos por 100 viviendas inspeccionadas.",
    domain: "entomological",
    tags: JSON.stringify(["vector", "surveillance", "breeding-sites"]),
  },
  {
    name: "Índice de vivienda (IV)",
    description: "Porcentaje de viviendas con al menos un criadero positivo.",
    domain: "entomological",
    tags: JSON.stringify(["vector", "surveillance", "breeding-sites"]),
  },
  {
    name: "Índice de depósito (ID)",
    description: "Porcentaje de depósitos positivos sobre el total inspeccionado.",
    domain: "entomological",
    tags: JSON.stringify(["vector", "surveillance", "breeding-sites"]),
  },
  {
    name: "Tipo de depósito positivo dominante",
    description: "Tipo de recipiente o depósito más frecuentemente positivo (ej. botellas, neumáticos, tanques).",
    domain: "entomological",
    tags: JSON.stringify(["vector", "surveillance", "breeding-sites"]),
  },
  {
    name: "Índice pupal",
    description: "Número de pupas por persona (estimación de la densidad de preimaginales).",
    domain: "entomological",
    tags: JSON.stringify(["vector", "surveillance", "density"]),
  },
  {
    name: "Número de ovitrampas positivas",
    description: "Conteo semanal de ovitrampas positivas por barrio.",
    domain: "entomological",
    tags: JSON.stringify(["vector", "surveillance", "monitoring"]),
  },
  {
    name: "Nivel de infestación crítica",
    description: "Zonas con IB > umbral establecido (ej. IB > 20) u otro umbral definido localmente.",
    domain: "entomological",
    tags: JSON.stringify(["vector", "surveillance", "risk-zones"]),
  },
  {
    name: "Índice Aédico en sumidero",
    description: "Porcentaje de sumideros con presencia de larvas de Aedes.",
    domain: "entomological",
    tags: JSON.stringify(["vector", "surveillance", "urban-infrastructure"]),
  },
  {
    name: "Índice de predio en concentraciones humanas",
    description: "% de predios en lugares de concentración humana con al menos un criadero positivo.",
    domain: "entomological",
    tags: JSON.stringify(["vector", "surveillance", "public-spaces"]),
  },
  {
    name: "Índice de depósito en concentraciones humanas",
    description: "% de depósitos positivos sobre el total inspeccionado en concentraciones humanas.",
    domain: "entomological",
    tags: JSON.stringify(["vector", "surveillance", "public-spaces"]),
  },
  {
    name: "Establecimiento de Wolbachia",
    description: "% de mosquitos Aedes positivos para Wolbachia (indicar sexo si es relevante).",
    domain: "entomological",
    tags: JSON.stringify(["vector", "biological-control", "wolbachia"]),
  },
  {
    name: "Número de casos por semana epidemiológica",
    description: "Número de casos reportados por cada semana epidemiológica.",
    domain: "epidemiological",
    tags: JSON.stringify(["cases", "surveillance", "temporal"]),
  },
  {
    name: "Tasa de incidencia semanal",
    description: "Casos nuevos por 100.000 habitantes en la semana.",
    domain: "epidemiological",
    tags: JSON.stringify(["cases", "surveillance", "temporal", "rates"]),
  },
  {
    name: "Zona del canal endémico (situación)",
    description: "Clasificación de la zona según la situación semanal de notificación (p. ej. endémico, epidémico, control).",
    domain: "epidemiological",
    tags: JSON.stringify(["cases", "surveillance", "endemic-channel"]),
  },
  {
    name: "Razón de crecimiento epidémico frente al año anterior",
    description: "Cambio porcentual de casos respecto al mismo periodo del año anterior.",
    domain: "epidemiological",
    tags: JSON.stringify(["cases", "surveillance", "trends"]),
  },
  {
    name: "Variación porcentual",
    description: "Cambio porcentual del número acumulado de casos respecto al año anterior.",
    domain: "epidemiological",
    tags: JSON.stringify(["cases", "surveillance", "trends"]),
  },
  {
    name: "Variación promedio vs. años anteriores",
    description: "Variación porcentual semanal frente al promedio semanal de los últimos 5 años.",
    domain: "epidemiological",
    tags: JSON.stringify(["cases", "surveillance", "trends"]),
  },
  {
    name: "Tipo de brote",
    description: "Clasificación del comportamiento de casos en últimas semanas: Tipo I: al menos 3 de las últimas 5 semanas con aumento; Tipo II: al menos 6 semanas con tendencia creciente.",
    domain: "epidemiological",
    tags: JSON.stringify(["cases", "surveillance", "outbreak"]),
  },
  {
    name: "Porcentaje de hospitalización por dengue",
    description: "Porcentaje de casos de dengue que requieren hospitalización.",
    domain: "epidemiological",
    tags: JSON.stringify(["clinical", "severity", "healthcare"]),
  },
  {
    name: "Edad (moda, mediana, promedio) de hospitalización",
    description: "Estadísticas de edad para casos hospitalizados.",
    domain: "epidemiological",
    tags: JSON.stringify(["clinical", "demographics", "healthcare"]),
  },
  {
    name: "Porcentaje de hospitalización por tipo",
    description: "Proporción de hospitalizaciones por tipo clínico sobre el total de casos.",
    domain: "epidemiological",
    tags: JSON.stringify(["clinical", "severity", "healthcare"]),
  },
  {
    name: "Casos según clasificación clínica",
    description: "Distribución por clasificación: Grave; Con signos de alarma; Sin signos de alarma.",
    domain: "epidemiological",
    tags: JSON.stringify(["clinical", "severity", "classification"]),
  },
  {
    name: "% de casos confirmados por laboratorio",
    description: "Porcentaje de casos con confirmación de laboratorio.",
    domain: "epidemiological",
    tags: JSON.stringify(["clinical", "laboratory", "diagnosis"]),
  },
  {
    name: "Letalidad",
    description: "Número de muertes probables por dengue / total de casos (porcentaje).",
    domain: "epidemiological",
    tags: JSON.stringify(["clinical", "mortality", "severity"]),
  },
  {
    name: "Muertes probables",
    description: "Conteo de muertes probables por dengue en el periodo.",
    domain: "epidemiological",
    tags: JSON.stringify(["clinical", "mortality", "severity"]),
  },
  {
    name: "Tiempo entre síntoma y consulta",
    description: "Días promedio entre fecha de inicio de síntomas y la consulta.",
    domain: "epidemiological",
    tags: JSON.stringify(["clinical", "healthcare-access", "timeliness"]),
  },
  {
    name: "Tiempo entre consulta y notificación",
    description: "Días promedio entre fecha de consulta y la notificación al sistema.",
    domain: "epidemiological",
    tags: JSON.stringify(["clinical", "healthcare-access", "timeliness"]),
  },
  {
    name: "Inicio y mantenimiento de brote histórico",
    description: "Identificación del barrio o zona que inició y mantiene el brote.",
    domain: "epidemiological",
    tags: JSON.stringify(["cases", "surveillance", "outbreak", "spatial"]),
  },
  {
    name: "Serotipos circulantes",
    description: "Frecuencia de cada serotipo sobre el total de muestras positivas.",
    domain: "epidemiological",
    tags: JSON.stringify(["clinical", "laboratory", "serotypes"]),
  },
  {
    name: "Tiempo de notificación y confirmación de casos",
    description: "Días transcurridos entre la aparición del caso y su notificación/confirmación en el sistema.",
    domain: "epidemiological",
    tags: JSON.stringify(["clinical", "surveillance", "timeliness"]),
  },
  {
    name: "Número de organizaciones sociales",
    description: "Número de organizaciones comunitarias o sociales involucradas en salud en la zona.",
    domain: "social",
    tags: JSON.stringify(["community", "social-participation", "organization"]),
  },
  {
    name: "Índice de Vulnerabilidad Socioeconómica",
    description: "Índice compuesto que incluye pobreza, hacinamiento, nivel educativo, etc.",
    domain: "social",
    tags: JSON.stringify(["socioeconomic", "vulnerability", "composite-index"]),
  },
  {
    name: "Densidad poblacional",
    description: "Habitantes por unidad de superficie (por barrio/comuna).",
    domain: "social",
    tags: JSON.stringify(["demographics", "population", "density"]),
  },
  {
    name: "Percepción de riesgo comunitario",
    description: "Resultado de encuestas o reportes cualitativos sobre percepción del riesgo.",
    domain: "social",
    tags: JSON.stringify(["community", "risk-perception", "qualitative"]),
  },
  {
    name: "Cobertura de educación preventiva",
    description: "Población alcanzada por campañas educativas (porcentaje o número).",
    domain: "social",
    tags: JSON.stringify(["education", "prevention", "coverage"]),
  },
  {
    name: "Prácticas preventivas",
    description: "Medidas de promoción y adopción de prácticas de prevención y control en hogares.",
    domain: "social",
    tags: JSON.stringify(["education", "prevention", "behavior"]),
  },
  {
    name: "Inspección y control de sumideros",
    description: "Número de sumideros controlados / número de sumideros inspeccionados.",
    domain: "control",
    tags: JSON.stringify(["vector-control", "intervention", "urban-infrastructure"]),
  },
  {
    name: "Inspección y control en viviendas",
    description: "Número de viviendas intervenidas / número de viviendas inspeccionadas.",
    domain: "control",
    tags: JSON.stringify(["vector-control", "intervention", "households"]),
  },
  {
    name: "Inspección y control en lugares de concentración humana",
    description: "Número de lugares de concentración controlados / inspeccionados (mercados, escuelas, etc.).",
    domain: "control",
    tags: JSON.stringify(["vector-control", "intervention", "public-spaces"]),
  },
  {
    name: "Cobertura en instituciones educativas",
    description: "Instituciones inspeccionadas / total de instituciones.",
    domain: "control",
    tags: JSON.stringify(["vector-control", "intervention", "schools"]),
  },
  {
    name: "Inspección y control en cuerpos de agua (control biológico)",
    description: "Número de siembras o re-siembras de peces / número de depósitos inspeccionados.",
    domain: "control",
    tags: JSON.stringify(["vector-control", "biological-control", "water-bodies"]),
  },
  {
    name: "Sector económico",
    description: "Sector económico predominante en la zona (puede influir en riesgo y respuesta).",
    domain: "environmental",
    tags: JSON.stringify(["socioeconomic", "contextual", "economic"]),
  },
  {
    name: "Cobertura de agua potable",
    description: "% de población con acceso a agua potable.",
    domain: "environmental",
    tags: JSON.stringify(["infrastructure", "water-supply", "coverage"]),
  },
  {
    name: "Continuidad en el servicio de acueducto",
    description: "Medida de continuidad/fiabilidad del suministro de agua.",
    domain: "environmental",
    tags: JSON.stringify(["infrastructure", "water-supply", "reliability"]),
  },
  {
    name: "Rechazo comunitario a intervención",
    description: "Número de viviendas renuentes / viviendas a inspeccionar.",
    domain: "social",
    tags: JSON.stringify(["community", "barriers", "resistance"]),
  },
  {
    name: "Presencia de basureros ilegales o puntos críticos de residuos",
    description: "Presencia de acumulación de residuos que pueden actuar como criaderos.",
    domain: "environmental",
    tags: JSON.stringify(["infrastructure", "waste-management", "breeding-sites"]),
  },
  {
    name: "Estado de canales de aguas lluvias (limpios / obstruidos)",
    description: "Condición física y operativa de canales pluviales urbanos.",
    domain: "environmental",
    tags: JSON.stringify(["infrastructure", "urban-drainage", "maintenance"]),
  },
  {
    name: "Estado de sumideros (limpios / obstruidos)",
    description: "Condición física y operativa de sumideros urbanos.",
    domain: "environmental",
    tags: JSON.stringify(["infrastructure", "urban-drainage", "maintenance"]),
  },
  {
    name: "Cobertura de zonas verdes y árboles por barrio",
    description: "% del área del barrio con cobertura vegetal significativa.",
    domain: "environmental",
    tags: JSON.stringify(["urban-planning", "green-spaces", "vegetation"]),
  },
  {
    name: "Frecuencia de recolección de residuos sólidos",
    description: "Número de veces por semana que se recoge la basura.",
    domain: "environmental",
    tags: JSON.stringify(["infrastructure", "waste-management", "frequency"]),
  },
  {
    name: "Índice de pluviosidad (días previos)",
    description: "Registro de lluvia en días previos; evalúa impacto en adherencia de aspersión química, viento y humedad.",
    domain: "climatic",
    tags: JSON.stringify(["weather", "rainfall", "environmental-conditions"]),
  },
  {
    name: "Temperatura máxima (días previos)",
    description: "Temperatura máxima de días previos; influencia en evaporación y eficacia de aspersión química.",
    domain: "climatic",
    tags: JSON.stringify(["weather", "temperature", "environmental-conditions"]),
  },
  {
    name: "Disponibilidad de equipos",
    description: "Inventario de equipos disponibles para control vectorial.",
    domain: "operational",
    tags: JSON.stringify(["resources", "equipment", "logistics"]),
  },
  {
    name: "Personal en terreno",
    description: "Número de personas necesarias/ disponibles para intervenciones en terreno.",
    domain: "operational",
    tags: JSON.stringify(["resources", "human-resources", "capacity"]),
  },
  {
    name: "Disponibilidad de insumos",
    description: "Inventario de insumos (insecticidas, equipos de protección, repuestos, etc.).",
    domain: "operational",
    tags: JSON.stringify(["resources", "supplies", "logistics"]),
  },
  {
    name: "Tiempo de respuesta de control vectorial desde la notificación",
    description: "Días entre la notificación de un caso y la ejecución de la primera acción de control vectorial en la zona.",
    domain: "operational",
    tags: JSON.stringify(["response", "timeliness", "efficiency"]),
  },
  {
    name: "Cobertura de eliminación de criaderos o control químico en zonas de brote",
    description: "Proporción de viviendas intervenidas respecto al total en el área del brote.",
    domain: "operational",
    tags: JSON.stringify(["response", "coverage", "intervention"]),
  },
  {
    name: "Tiempo de alistamiento de brigadas",
    description: "Días promedio desde alerta hasta intervención por brigada.",
    domain: "operational",
    tags: JSON.stringify(["response", "timeliness", "brigades"]),
  },
  {
    name: "Tiempo promedio de ejecución",
    description: "Días promedio para ejecutar la intervención por barrio.",
    domain: "operational",
    tags: JSON.stringify(["response", "timeliness", "execution"]),
  },
  {
    name: "Cobertura territorial por brigada",
    description: "Número de barrios o viviendas cubiertas por día por una brigada.",
    domain: "operational",
    tags: JSON.stringify(["response", "capacity", "coverage"]),
  },
  {
    name: "Costos unitarios por intervención",
    description: "Costo en USD por acción (fumigación, control larvario, campañas, etc.).",
    domain: "operational",
    tags: JSON.stringify(["resources", "costs", "economic"]),
  },
  {
    name: "Disponibilidad logística semanal",
    description: "Número de brigadas, equipos o insumos disponibles por semana.",
    domain: "operational",
    tags: JSON.stringify(["resources", "logistics", "capacity"]),
  },
  {
    name: "Capacidad máxima por comuna",
    description: "Límite operativo estimado por zona (máxima capacidad de respuesta).",
    domain: "operational",
    tags: JSON.stringify(["resources", "capacity", "limits"]),
  },
  {
    name: "Probabilidad de reducción de casos",
    description: "% estimado de casos evitados en 2–3 semanas tras intervención.",
    domain: "impact",
    tags: JSON.stringify(["effectiveness", "prediction", "intervention"]),
  },
  {
    name: "Reducción de índice de Breteau tras control larvario",
    description: "Delta (cambio) esperado en IB post intervención.",
    domain: "impact",
    tags: JSON.stringify(["effectiveness", "vector-control", "measurement"]),
  },
  {
    name: "Retención de aprendizaje comunitario",
    description: "% de hogares que mantienen prácticas preventivas después de 1 mes.",
    domain: "impact",
    tags: JSON.stringify(["effectiveness", "education", "behavior-change"]),
  },
  {
    name: "Tasa de reinfestación",
    description: "Tiempo estimado hasta reaparición de foco tras intervención.",
    domain: "impact",
    tags: JSON.stringify(["effectiveness", "sustainability", "vector-control"]),
  },
  {
    name: "Disponibilidad de camas hospitalarias/UCI para dengue grave",
    description: "Número y proporción de camas disponibles para manejo de dengue grave durante un brote.",
    domain: "healthcare",
    tags: JSON.stringify(["resources", "capacity", "hospital"]),
  },
  {
    name: "Cobertura de hogares alcanzados con mensajes de riesgo",
    description: "% de hogares en la zona del brote que recibieron comunicación educativa sobre dengue.",
    domain: "social",
    tags: JSON.stringify(["education", "communication", "coverage"]),
  },
];

const scenarios = [
  {
    title: "Transmisión urbana intensa",
    description: "Zona urbana con alta densidad poblacional y transmisión activa de dengue",
    order: 1,
  },
  {
    title: "Factores climáticos favorables",
    description: "Condiciones climáticas que favorecen la reproducción del vector (alta temperatura y humedad)",
    order: 2,
  },
  {
    title: "Brote epidémico en curso",
    description: "Incremento súbito y significativo de casos en comparación con periodos anteriores",
    order: 3,
  },
  {
    title: "Zona con vulnerabilidad socioeconómica alta",
    description: "Área con condiciones socioeconómicas que aumentan el riesgo de transmisión",
    order: 4,
  },
  {
    title: "Déficit en infraestructura urbana",
    description: "Deficiencias en servicios de agua, recolección de residuos y drenaje",
    order: 5,
  },
  {
    title: "Presencia de múltiples serotipos",
    description: "Circulación simultánea de diferentes serotipos de dengue en la zona",
    order: 6,
  },
  {
    title: "Alta prevalencia de criaderos",
    description: "Índices entomológicos elevados indicando abundancia de sitios de reproducción del mosquito",
    order: 7,
  },
  {
    title: "Baja participación comunitaria",
    description: "Resistencia o falta de involucramiento de la comunidad en actividades preventivas",
    order: 8,
  },
  {
    title: "Capacidad de respuesta limitada",
    description: "Recursos insuficientes (personal, equipos, insumos) para control vectorial efectivo",
    order: 9,
  },
  {
    title: "Zona de alta movilidad poblacional",
    description: "Área con alto tránsito de personas que facilita la dispersión del virus",
    order: 10,
  },
  {
    title: "Hospitalizaciones en aumento",
    description: "Incremento en casos graves que requieren atención hospitalaria",
    order: 11,
  },
  {
    title: "Reinfestación post-intervención",
    description: "Zona donde reaparece la infestación después de actividades de control",
    order: 12,
  },
  {
    title: "Concentraciones humanas de riesgo",
    description: "Escuelas, mercados u otros lugares con alta concentración de personas expuestas",
    order: 13,
  },
  {
    title: "Introducción de Wolbachia",
    description: "Implementación de estrategia de control biológico con mosquitos modificados",
    order: 14,
  },
  {
    title: "Temporada de lluvias",
    description: "Periodo estacional con precipitaciones que aumentan criaderos potenciales",
    order: 15,
  },
  {
    title: "Detección temprana de casos",
    description: "Sistema de vigilancia efectivo que permite identificación rápida de casos",
    order: 16,
  },
  {
    title: "Intervención educativa exitosa",
    description: "Zona con alta adopción de prácticas preventivas por la población",
    order: 17,
  },
  {
    title: "Evaluación de impacto de intervenciones",
    description: "Medición de efectividad de las acciones de control implementadas",
    order: 18,
  },
  {
    title: "Planificación de recursos para brote",
    description: "Preparación y asignación anticipada de recursos ante riesgo de brote",
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
      title: "Encuesta de Validación de Indicadores Epidemiológicos - Dengue 2025",
      version: "1.0",
      active: true,
    },
    create: {
      id: "survey-dengue-2025",
      title: "Encuesta de Validación de Indicadores Epidemiológicos - Dengue 2025",
      version: "1.0",
      active: true,
    },
  });
  console.log(`✅ Created survey: ${survey.title}`);

  // Create scenarios
  console.log("🎯 Creating 19 scenarios...");
  for (const scenario of scenarios) {
    await prisma.scenario.upsert({
      where: {
        surveyId_order: {
          surveyId: survey.id,
          order: scenario.order,
        },
      },
      update: {
        title: scenario.title,
        description: scenario.description,
      },
      create: {
        surveyId: survey.id,
        title: scenario.title,
        description: scenario.description,
        order: scenario.order,
        active: true,
      },
    });
  }
  console.log(`✅ Created ${scenarios.length} scenarios`);

  // Create test tokens (expires in 10 days)
  console.log("🔑 Creating test tokens...");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 10);

  const testRoles = [
    "epidemiologist",
    "entomologist",
    "biologist",
    "health-authority",
    "researcher",
  ];

  for (let i = 0; i < testRoles.length; i++) {
    const role = testRoles[i];
    const token = `TEST-TOKEN-${role.toUpperCase()}-${i + 1}`;

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
  console.log(`✅ Created ${testRoles.length} test tokens`);

  console.log("\n📝 Test tokens:");
  testRoles.forEach((role, i) => {
    console.log(`   ${i + 1}. TEST-TOKEN-${role.toUpperCase()}-${i + 1} (${role})`);
  });

  console.log("\n✨ Seeding completed!");
  console.log("\n🚀 You can now:");
  console.log("   1. Run 'npm run dev' to start the development server");
  console.log("   2. Access the survey with any test token:");
  console.log("      http://localhost:3000/survey/TEST-TOKEN-EPIDEMIOLOGIST-1");
  console.log("   3. Run 'npm run db:studio' to view the database");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
