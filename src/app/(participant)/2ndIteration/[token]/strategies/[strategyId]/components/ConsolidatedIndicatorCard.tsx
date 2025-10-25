import { useState } from "react";
import type { Indicator } from "@/domain/models";
import { getIndicatorScale } from "@/domain/constants";

interface ConsolidatedData {
  weights: number[];
  average: number;
  count: number;
  thresholds: string[];
}

interface ConsolidatedIndicatorCardProps {
  indicator: Indicator;
  consolidatedData: ConsolidatedData;
  userWeight: number;
  userThreshold: string | null;
  excluded: boolean;
  isOriginal: boolean;
  onWeightChange: (indicatorId: string, value: number) => void;
  onThresholdChange: (indicatorId: string, value: string) => void;
  onExcludedChange: (indicatorId: string, excluded: boolean) => void;
  showWeightWarning: boolean;
  allUserResponses: Record<string, { weight: number; excluded: boolean }>;
}

export function ConsolidatedIndicatorCard({
  indicator,
  consolidatedData,
  userWeight,
  userThreshold,
  excluded,
  isOriginal,
  onWeightChange,
  onThresholdChange,
  onExcludedChange,
  showWeightWarning,
  allUserResponses,
}: ConsolidatedIndicatorCardProps) {
  const hasZeroWeight = userWeight === 0;
  const shouldHighlightZeroWeight = hasZeroWeight && showWeightWarning;

  // Calcular porcentaje normalizado
  const normalizedPercentage = consolidatedData.average;

  // Calcular el máximo posible basado en otros indicadores no excluidos
  const othersTotal = Object.entries(allUserResponses).reduce(
    (sum, [id, response]) => {
      if (id === indicator.id || response.excluded) {
        return sum;
      }
      return sum + response.weight;
    },
    0
  );
  const maxAllowed = Math.max(0, 100 - othersTotal);

  // Función para manejar el click inteligente en el slider
  const handleSliderClick = (e: React.MouseEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    const rect = target.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = (clickX / rect.width) * 100;
    const clickedValue = Math.round(percentage);
    
    // Si el valor clickeado es mayor al máximo permitido, usar el máximo
    const finalValue = Math.min(clickedValue, maxAllowed);
    onWeightChange(indicator.id, finalValue);
  };

  return (
    <div
      className={`space-y-3 rounded-lg border p-4 transition-all ${
        shouldHighlightZeroWeight
          ? "border-amber-300 bg-amber-50"
          : "border-slate-200 bg-white"
      }`}
    >
      {/* Header con nombre y badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 relative group/label z-[100]">
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-slate-900 cursor-help">
              {indicator.name}
            </label>
            {!isOriginal && (
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                Usted no consideró este indicador en la primera iteración
              </span>
            )}
          </div>
          {/* Tooltip con descripción */}
          {indicator.description && (
            <div
              className="absolute left-0 top-full mt-2 hidden w-72 animate-fadeIn group-hover/label:block"
              style={{ zIndex: 9999 }}
            >
              <div className="rounded-lg border border-slate-700/30 bg-slate-900/70 p-3 text-xs text-white shadow-xl backdrop-blur-md">
                <p className="mb-1 font-semibold text-blue-300">
                  {indicator.name}
                </p>
                <p className="leading-relaxed text-slate-200">
                  {indicator.description}
                </p>
                <div className="absolute left-4 bottom-full h-0 w-0 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-slate-900/70"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Estadísticas consolidadas */}
      <div className="rounded-md bg-blue-50 p-4 space-y-3">
        {/* Información general */}
        <div className="text-xs text-slate-600 pb-2 border-b border-blue-200">
          {consolidatedData.count} experto(s)
          {isOriginal ? " incluyéndolo a usted," : ""} seleccionaron este indicador
        </div>

        {/* Sección de Pesos */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 w-1 h-4 bg-green-500 rounded-full"></div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Ponderaciones
            </h4>
          </div>
          
          <div className="pl-4 space-y-1.5">
            <div className="text-xs text-slate-700">
              <span className="font-medium">Pesos individuales de otros expertos:</span>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {consolidatedData.weights.map((weight, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-medium text-[11px]">
                    {weight}%
                  </span>
                ))}
              </div>
            </div>
            
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-xs font-medium text-slate-700">Promedio del grupo:</span>
              <span className="text-lg font-bold text-green-700">
                {normalizedPercentage.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Sección de Umbrales */}
        {consolidatedData.thresholds.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-blue-200">
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0 w-1 h-4 bg-purple-500 rounded-full"></div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Umbrales
              </h4>
            </div>
            
            <div className="pl-4">
              <div className="text-xs text-slate-700">
                <span className="font-medium">Umbrales propuestos por otros expertos:</span>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {consolidatedData.thresholds.map((threshold, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-medium text-[11px]">
                      {threshold}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input de peso del usuario */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <label className="text-xs font-medium text-slate-700">
            Su ponderación es {userWeight}%. Teniendo en cuenta la ponderación de otros expertos y el promedio del grupo, puede ajustarla si lo considera necesario:
          </label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={userWeight === 0 ? "" : Math.round(userWeight)}
              onChange={(e) =>
                onWeightChange(
                  indicator.id,
                  Math.round(Number.parseFloat(e.target.value) || 0)
                )
              }
              onKeyDown={(e) => {
                // Prevenir la entrada de punto, coma, "e", "+", "-"
                if (['.', ',', 'e', 'E', '+', '-'].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              placeholder="0"
              className="w-16 rounded border border-slate-200 px-2 py-1 text-xs text-right focus:border-blue-500 focus:ring-blue-200"
            />
            <span className="text-[10px] font-semibold text-slate-500">%</span>
          </div>
        </div>

        {/* Slider */}
        <div className="relative">
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={userWeight}
            onChange={(e) =>
              onWeightChange(indicator.id, Number.parseFloat(e.target.value))
            }
            onClick={handleSliderClick}
            className="w-full cursor-pointer"
          />
          {/* Marcas de escala */}
          <div className="mt-1 flex justify-between px-0.5">
            {[0, 25, 50, 75, 100].map((mark) => (
              <div key={mark} className="flex flex-col items-center">
                <div className="h-1.5 w-px bg-slate-300"></div>
                <span className="mt-0.5 text-[10px] text-slate-400">
                  {mark}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Threshold */}
      <div className="pt-2 text-xs text-slate-600">
        <div className="flex flex-col gap-1">
          <label className="font-medium text-slate-500">
            Su umbral: {userThreshold || "(no definido)"}. Teniendo en cuenta los umbrales de otros expertos, puede ajustarlo si lo considera necesario
            {getIndicatorScale(indicator.name) && (
              <span className="ml-1 text-slate-600">
                (Escala: {getIndicatorScale(indicator.name)})
              </span>
            )}:
          </label>
          <input
            type="text"
            value={userThreshold || ""}
            onChange={(e) => onThresholdChange(indicator.id, e.target.value)}
            placeholder={getIndicatorScale(indicator.name) || "Ingrese el umbral"}
            maxLength={90}
            className="w-full rounded border border-slate-200 px-2 py-1 text-xs focus:border-blue-500 focus:ring-blue-200"
          />
        </div>
      </div>
    </div>
  );
}
