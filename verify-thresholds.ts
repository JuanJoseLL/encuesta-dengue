/**
 * Script para verificar que todos los indicadores tienen umbrales definidos
 */

// Indicadores del seed.ts
const indicators = [
  "Índice de Breteau (IB)",
  "Índice de vivienda (IV)",
  "Índice de depósito (ID)",
  "Tipo de depósito positivo dominante",
  "Índice pupal",
  "Número de ovitrampas positivas",
  "Nivel de infestación crítica",
  "Índice Aédico en sumidero",
  "Índice de predio en concentraciones humanas",
  "Índice de depósito en concentraciones humanas",
  "Establecimiento de Wolbachia",
  "Número de casos por semana epidemiológica",
  "Tasa de incidencia semanal",
  "Zona del canal endémico (situación)",
  "Razón de crecimiento epidémico frente al año anterior",
  "Variación porcentual",
  "Variación promedio vs. años anteriores",
  "Tipo de brote",
  "Porcentaje de hospitalización por dengue",
  "Edad (moda, mediana, promedio) de hospitalización",
  "Porcentaje de hospitalización por tipo",
  "Casos según clasificación clínica",
  "% de casos confirmados por laboratorio",
  "Letalidad",
  "Muertes probables",
  "Tiempo entre síntoma y consulta",
  "Tiempo entre consulta y notificación",
  "Inicio y mantenimiento de brote histórico",
  "Serotipos circulantes",
  "Tiempo de notificación y confirmación de casos",
  "Número de organizaciones sociales",
  "Índice de Vulnerabilidad Socioeconómica",
  "Densidad poblacional",
  "Percepción de riesgo comunitario",
  "Cobertura de educación preventiva",
  "Prácticas preventivas",
  "Inspección y control de sumideros",
  "Inspección y control en viviendas",
  "Inspección y control en lugares de concentración humana",
  "Cobertura en instituciones educativas",
  "Inspección y control en cuerpos de agua (control biológico)",
  "Sector económico",
  "Cobertura de agua potable",
  "Continuidad en el servicio de acueducto",
  "Rechazo comunitario a intervención",
  "Presencia de basureros ilegales o puntos críticos de residuos",
  "Estado de canales de aguas lluvias (limpios / obstruidos)",
  "Estado de sumideros (limpios / obstruidos)",
  "Cobertura de zonas verdes y árboles por barrio",
  "Frecuencia de recolección de residuos sólidos",
  "Índice de pluviosidad (días previos)",
  "Temperatura máxima (días previos)",
  "Disponibilidad de equipos",
  "Personal en terreno",
  "Disponibilidad de insumos",
  "Tiempo de respuesta de control vectorial desde la notificación",
  "Cobertura de eliminación de criaderos o control químico en zonas de brote",
  "Tiempo de alistamiento de brigadas",
  "Tiempo promedio de ejecución",
  "Cobertura territorial por brigada",
  "Costos unitarios por intervención",
  "Disponibilidad logística semanal",
  "Capacidad máxima por comuna",
  "Probabilidad de reducción de casos",
  "Reducción de índice de Breteau tras control larvario",
  "Retención de aprendizaje comunitario",
  "Tasa de reinfestación",
  "Disponibilidad de camas hospitalarias/UCI para dengue grave",
  "Cobertura de hogares alcanzados con mensajes de riesgo",
];

// Importar umbrales
import { INDICATOR_THRESHOLDS } from './src/domain/constants/thresholds';

console.log('🔍 Verificando umbrales para 69 indicadores...\n');

let missingCount = 0;
const missingIndicators: string[] = [];

indicators.forEach((indicator, index) => {
  const threshold = INDICATOR_THRESHOLDS[indicator];
  if (!threshold) {
    missingCount++;
    missingIndicators.push(`  ${index + 1}. "${indicator}"`);
    console.log(`❌ Indicador ${index + 1}: "${indicator}" - SIN UMBRAL`);
  } else {
    console.log(`✅ Indicador ${index + 1}: "${indicator}" → ${threshold}`);
  }
});

console.log('\n' + '='.repeat(80));
console.log(`📊 RESUMEN:`);
console.log(`   Total de indicadores: ${indicators.length}`);
console.log(`   Con umbral definido: ${indicators.length - missingCount}`);
console.log(`   Sin umbral definido: ${missingCount}`);

if (missingCount > 0) {
  console.log('\n❌ Indicadores faltantes:');
  console.log(missingIndicators.join('\n'));
  process.exit(1);
} else {
  console.log('\n✅ ¡Todos los 69 indicadores tienen umbral definido!');
  process.exit(0);
}
