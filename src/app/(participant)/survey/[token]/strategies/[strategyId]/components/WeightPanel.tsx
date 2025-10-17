import type { Indicator } from "@/domain/models";
import type { IndicatorAllocation } from "../types";
import { WeightSlider } from "./WeightSlider";

interface WeightPanelProps {
  selectedIndicators: Set<string>;
  availableIndicators: Indicator[];
  weights: Record<string, IndicatorAllocation>;
  onWeightChange: (indicatorId: string, value: number) => void;
  onThresholdChange: (indicatorId: string, value: string) => void;
  onAutoDistribute: () => void;
  onUndo: () => void;
  showWeightWarning: boolean;
  hasIndicatorsWithoutWeight: boolean;
  hasInvalidThresholds: boolean;
  previousWeights: Record<string, IndicatorAllocation> | null;
  totalWeight: number;
  isValid: boolean;
}

export function WeightPanel({
  selectedIndicators,
  availableIndicators,
  weights,
  onWeightChange,
  onThresholdChange,
  onAutoDistribute,
  onUndo,
  showWeightWarning,
  hasIndicatorsWithoutWeight,
  hasInvalidThresholds,
  previousWeights,
  totalWeight,
  isValid,
}: WeightPanelProps) {
  const remaining = 100 - totalWeight;

  return (
    <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        Asignación de pesos ponderados
      </h2>

      {/* Total Progress */}
      <div className="mt-4 rounded-lg bg-slate-50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">
            Total asignado:
          </span>
          <span
            className={`text-2xl font-bold ${
              isValid
                ? "text-green-600"
                : totalWeight > 100
                ? "text-red-600"
                : "text-amber-600"
            }`}
          >
            {totalWeight.toFixed(1)}%
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-full transition-all ${
              isValid
                ? "bg-green-500"
                : totalWeight > 100
                ? "bg-red-500"
                : "bg-amber-500"
            }`}
            style={{ width: `${Math.min(totalWeight, 100)}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-slate-600">
          {remaining > 0
            ? `Faltan ${remaining.toFixed(1)}%`
            : remaining < 0
            ? `Excedido por ${Math.abs(remaining).toFixed(1)}%`
            : "Suma correcta ✓"}
        </div>
      </div>

      {/* Auto Distribute & Undo Buttons */}
      {selectedIndicators.size > 0 && (
        <div className="mt-4 flex gap-2">
          <div className="relative flex-1 group">
            <button
              onClick={onAutoDistribute}
              className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-md hover:from-blue-700 hover:to-blue-800 hover:shadow-lg hover:cursor-pointer transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              title="Distribuir pesos automáticamente"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Repartir equitativamente
            </button>
            {/* Tooltip */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-20 w-64 animate-fadeIn">
              <div className="bg-slate-900/70 backdrop-blur-md text-white text-xs rounded-lg p-3 shadow-xl border border-slate-700/30">
                <p className="font-semibold mb-1">Distribución automática</p>
                <p className="text-slate-300">
                  Asigna automáticamente los pesos de manera equitativa entre
                  todos los indicadores seleccionados, garantizando que la suma
                  total sea exactamente 100%.
                </p>
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-slate-900/70"></div>
              </div>
            </div>
          </div>

          {previousWeights && (
            <div className="relative group">
              <button
                onClick={onUndo}
                className="rounded-lg bg-amber-600 px-4 py-3 text-sm font-semibold text-white shadow-md hover:bg-amber-700 hover:shadow-lg hover:cursor-pointer transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
                title="Deshacer distribución"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                  />
                </svg>
              </button>
              {/* Tooltip */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-20 w-56 animate-fadeIn">
                <div className="bg-slate-900/70 backdrop-blur-md text-white text-xs rounded-lg p-3 shadow-xl border border-slate-700/30">
                  <p className="font-semibold mb-1">Deshacer cambios</p>
                  <p className="text-slate-300">
                    Restaura la distribución de pesos anterior antes de aplicar
                    la distribución equitativa.
                  </p>
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-slate-900/70"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Warning for indicators without weight */}
      {showWeightWarning && hasIndicatorsWithoutWeight && (
        <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-3 flex items-start gap-2">
          <svg
            className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800">
              Algunos indicadores no tienen porcentaje asignado
            </p>
            <p className="text-xs text-amber-700 mt-1">
              Por favor, asigne un porcentaje a todos los indicadores
              seleccionados antes de continuar.
            </p>
          </div>
        </div>
      )}

      {hasInvalidThresholds && (
        <div className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 flex items-start gap-2">
          <svg
            className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-red-700">
              Ajusta los umbrales inválidos
            </p>
            <p className="text-xs text-red-600 mt-1">
              El umbral debe ser un valor mayor a 0%.
            </p>
          </div>
        </div>
      )}

      {/* Weight Sliders */}
      <div className="mt-4 max-h-[600px] space-y-3 overflow-y-auto">
        {Array.from(selectedIndicators).map((indicatorId) => {
          const indicator = availableIndicators.find(
            (ind) => ind.id === indicatorId
          );
          if (!indicator) return null;

          const allocation = weights[indicatorId] ?? {
            weight: 0,
            threshold: null,
          };

          return (
            <WeightSlider
              key={indicatorId}
              indicator={indicator}
              allocation={allocation}
              onWeightChange={onWeightChange}
              onThresholdChange={onThresholdChange}
              showWeightWarning={showWeightWarning}
            />
          );
        })}
      </div>

      {selectedIndicators.size === 0 && (
        <div className="mt-4 text-center text-sm text-slate-500">
          Primero seleccione al menos un indicador en la lista izquierda para
          comenzar la asignación.
        </div>
      )}
    </div>
  );
}
