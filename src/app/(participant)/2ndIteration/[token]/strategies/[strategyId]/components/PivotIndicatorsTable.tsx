"use client";

import { useMemo } from "react";
import type { Indicator } from "@/domain/models";
import { getIndicatorScale } from "@/domain/constants";

interface UserResponse {
  indicatorId: string;
  weight: number;
  threshold: string | null;
  excluded: boolean;
  isOriginal: boolean;
}

interface ConsolidatedIndicator {
  indicatorId: string;
  indicatorName: string;
  indicatorDescription: string | null;
  weights: number[];
  thresholds: string[];
  average: number;
  count: number;
  totalRespondents: number;
}

interface PivotIndicatorsTableProps {
  indicators: Indicator[];
  consolidatedIndicators: ConsolidatedIndicator[];
  userResponses: Record<string, UserResponse>;
  onWeightChange: (indicatorId: string, value: number) => void;
  onThresholdChange: (indicatorId: string, value: string) => void;
  allUserResponses: Record<string, UserResponse>;
}

export function PivotIndicatorsTable({
  indicators,
  consolidatedIndicators,
  userResponses,
  onWeightChange,
  onThresholdChange,
  allUserResponses,
}: PivotIndicatorsTableProps) {
  // Calcular el número máximo de expertos para crear las columnas
  const maxExperts = useMemo(() => {
    return Math.max(
      ...consolidatedIndicators.map((ind) => ind.weights.length),
      0
    );
  }, [consolidatedIndicators]);

  // Preparar datos ordenados (primero originales del usuario)
  const sortedIndicators = useMemo(() => {
    return consolidatedIndicators
      .map((consInd) => {
        const indicator = indicators.find((ind) => ind.id === consInd.indicatorId);
        if (!indicator) return null;

        const userResponse = userResponses[consInd.indicatorId] || {
          indicatorId: consInd.indicatorId,
          weight: 0,
          threshold: null,
          excluded: false,
          isOriginal: false,
        };

        return {
          indicator,
          consolidatedData: consInd,
          userResponse,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => {
        if (a.userResponse.isOriginal === b.userResponse.isOriginal) {
          return 0;
        }
        return a.userResponse.isOriginal ? -1 : 1;
      });
  }, [consolidatedIndicators, indicators, userResponses]);

  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-lg">
      {/* Información de ayuda */}
      <div className="bg-indigo-50 border-b border-indigo-200 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-indigo-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm text-indigo-900">
              <strong>Vista Excel:</strong> Compare las ponderaciones de todos los expertos horizontalmente.
              Puede hacer scroll horizontal para ver todos los expertos. La columna de indicadores permanece fija.
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          {/* Header */}
          <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
            <tr>
              {/* Columna de Indicador */}
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider border-r-2 border-slate-300 bg-slate-100 sticky left-0 z-20 min-w-[280px] shadow-md">
                Indicador
              </th>

              {/* Columnas de Expertos */}
              {Array.from({ length: maxExperts }, (_, i) => (
                <th
                  key={`expert-${i}`}
                  className="px-3 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider border-r border-slate-200 min-w-[140px]"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span>Experto {i + 1}</span>
                  </div>
                </th>
              ))}

              {/* Columna de Promedio */}
              <th className="px-4 py-3 text-center text-xs font-semibold text-green-700 uppercase tracking-wider border-r-2 border-green-300 bg-green-50 min-w-[110px]">
                <div className="flex flex-col items-center gap-1">
                  <span>Promedio</span>
                  <span className="text-[10px] text-green-600 font-normal">Grupo</span>
                </div>
              </th>

              {/* Columna de Tu Peso */}
              <th className="px-4 py-3 text-center text-xs font-semibold text-blue-700 uppercase tracking-wider border-r-2 border-blue-300 bg-blue-50 min-w-[130px]">
                <div className="flex flex-col items-center gap-1">
                  <span>Tu Peso</span>
                  <span className="text-[10px] text-blue-600 font-normal">Editable</span>
                </div>
              </th>

              {/* Columna de Tu Umbral */}
              <th className="px-4 py-3 text-center text-xs font-semibold text-purple-700 uppercase tracking-wider bg-purple-50 min-w-[180px]">
                <div className="flex flex-col items-center gap-1">
                  <span>Tu Umbral</span>
                  <span className="text-[10px] text-purple-600 font-normal">Editable</span>
                </div>
              </th>
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-slate-200">
            {sortedIndicators.map((item) => {
              const { indicator, consolidatedData, userResponse } = item;

              // Calcular el máximo permitido para este indicador
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

              return (
                <tr key={indicator.id} className="hover:bg-slate-50 transition-colors">
                    {/* Indicador */}
                    <td className="px-4 py-3 text-sm border-r-2 border-slate-300 bg-slate-50 sticky left-0 z-10 shadow-sm">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">
                            {indicator.name}
                          </span>
                          {!userResponse.isOriginal && (
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 whitespace-nowrap">
                              Nuevo
                            </span>
                          )}
                        </div>
                        {indicator.description && (
                          <span className="text-xs text-slate-500 line-clamp-2" title={indicator.description}>
                            {indicator.description}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Pesos y umbrales de expertos */}
                    {Array.from({ length: maxExperts }, (_, i) => {
                      const weight = consolidatedData.weights[i];
                      const threshold = consolidatedData.thresholds[i];
                      return (
                        <td
                          key={`${indicator.id}-expert-${i}`}
                          className="px-3 py-2 text-center text-sm border-r border-slate-200"
                        >
                          <div className="flex flex-col gap-2">
                            {/* Peso */}
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-[10px] text-slate-500 font-semibold uppercase">Peso</span>
                              {weight !== undefined ? (
                                <span className="inline-flex items-center justify-center px-2 py-1 rounded-md bg-slate-100 text-slate-700 font-medium min-w-[50px]">
                                  {weight}%
                                </span>
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </div>

                            {/* Umbral */}
                            <div className="flex flex-col items-center gap-1 border-t border-slate-200 pt-2">
                              <span className="text-[10px] text-purple-600 font-semibold uppercase">Umbral</span>
                              {threshold !== undefined && threshold !== "" ? (
                                <div className="group relative inline-flex items-center justify-center px-2 py-1 rounded-md bg-purple-50 text-purple-700 font-medium text-xs border border-purple-200 min-w-[50px] max-w-[120px] cursor-help">
                                  <span className="truncate block max-w-full">
                                    {threshold}
                                  </span>
                                  {/* Tooltip al hacer hover */}
                                  {threshold.length > 15 && (
                                    <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-50 max-w-xs whitespace-normal break-words">
                                      {threshold}
                                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-300 text-xs">—</span>
                              )}
                            </div>
                          </div>
                        </td>
                      );
                    })}

                    {/* Promedio */}
                    <td className="px-4 py-3 text-center text-sm border-r-2 border-green-300 bg-green-50">
                      <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-md bg-green-100 text-green-700 font-bold min-w-[70px] text-base">
                        {consolidatedData.average.toFixed(1)}%
                      </span>
                    </td>

                    {/* Tu Peso (editable) */}
                    <td className="px-4 py-3 text-center text-sm border-r-2 border-blue-300 bg-blue-50">
                      <div className="flex items-center justify-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          value={userResponse.weight === 0 ? "" : Math.round(userResponse.weight)}
                          onChange={(e) => {
                            const value = Math.round(Number.parseFloat(e.target.value) || 0);
                            const clampedValue = Math.min(value, maxAllowed);
                            onWeightChange(indicator.id, clampedValue);
                          }}
                          onKeyDown={(e) => {
                            if (['.', ',', 'e', 'E', '+', '-'].includes(e.key)) {
                              e.preventDefault();
                            }
                          }}
                          placeholder="0"
                          className="w-16 rounded border border-blue-300 px-2 py-1 text-sm text-center focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
                        />
                        <span className="text-sm font-medium text-blue-700">%</span>
                      </div>
                    </td>

                    {/* Tu Umbral (editable) */}
                    <td className="px-4 py-3 text-sm bg-purple-50">
                      <input
                        type="text"
                        value={userResponse.threshold || ""}
                        onChange={(e) => onThresholdChange(indicator.id, e.target.value)}
                        placeholder={getIndicatorScale(indicator.name) || "Ingrese umbral"}
                        maxLength={90}
                        className="w-full rounded-md border border-purple-300 px-3 py-1.5 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                      />
                    </td>
                  </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {sortedIndicators.length === 0 && (
        <div className="p-8 text-center text-slate-500">
          No hay indicadores para mostrar
        </div>
      )}

      {/* Leyenda */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 py-3">
        <div className="flex flex-wrap gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-100 border border-green-300"></div>
            <span>Promedio del grupo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-100 border border-blue-300"></div>
            <span>Tu ponderación (editable)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-purple-100 border border-purple-300"></div>
            <span>Tu umbral (editable)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
