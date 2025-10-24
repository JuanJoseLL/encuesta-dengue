import type { Indicator } from "@/domain/models";
import type { IndicatorAllocation } from "../types";
import { getIndicatorScale, getIndicatorThreshold } from "@/domain/constants";

interface WeightSliderProps {
  indicator: Indicator;
  allocation: IndicatorAllocation;
  onWeightChange: (indicatorId: string, value: number) => void;
  onThresholdChange: (indicatorId: string, value: string) => void;
  showWeightWarning: boolean;
  allWeights: Record<string, IndicatorAllocation>;
}

export function WeightSlider({
  indicator,
  allocation,
  onWeightChange,
  onThresholdChange,
  showWeightWarning,
  allWeights,
}: WeightSliderProps) {
  const hasZeroWeight = (allocation.weight ?? 0) === 0;
  const thresholdValue = allocation.threshold ?? "";
  const thresholdInvalid = false; // No validation - accept any text

  const shouldHighlightZeroWeight = hasZeroWeight && showWeightWarning;

  return (
    <div
      className={`space-y-2 rounded-lg border p-3 transition-all ${
        thresholdInvalid
          ? "border-red-300 bg-red-50"
          : shouldHighlightZeroWeight
          ? "border-amber-300 bg-amber-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="relative group/label z-[100]">
          <label className="text-xs font-medium text-slate-700 cursor-help">
            {indicator.name}
          </label>
          {/* Tooltip con descripción - siempre hacia abajo */}
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
        <div className="flex items-center gap-1">
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={allocation.weight === 0 ? "" : allocation.weight ?? ""}
            onChange={(e) =>
              onWeightChange(
                indicator.id,
                Number.parseFloat(e.target.value) || 0
              )
            }
            placeholder="0"
            className={`w-16 rounded border px-2 py-1 text-xs text-right ${
              thresholdInvalid
                ? "border-red-300 focus:border-red-400 focus:ring-red-200"
                : "border-slate-200 focus:border-blue-500 focus:ring-blue-200"
            }`}
          />
          <span className="text-[10px] font-semibold text-slate-500">%</span>
        </div>
      </div>
      {/* Slider con escala visual */}
      <div className="relative">
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={allocation.weight ?? 0}
          onChange={(e) =>
            onWeightChange(indicator.id, Number.parseFloat(e.target.value))
          }
          className="w-full cursor-pointer"
        />
        {/* Marcas de escala */}
        <div className="mt-1 flex justify-between px-0.5">
          {[0, 25, 50, 75, 100].map((mark) => (
            <div key={mark} className="flex flex-col items-center">
              <div className="h-1.5 w-px bg-slate-300"></div>
              <span className="mt-0.5 text-[10px] text-slate-400">{mark}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2 text-xs text-slate-600">
        <div className="flex flex-col gap-1">
          <label className="font-medium text-slate-500">
            Umbral
            {getIndicatorScale(indicator.name) && (
              <span className="ml-1 text-slate-600">
                ({getIndicatorScale(indicator.name)})
              </span>
            )}
            {getIndicatorThreshold(indicator.name) && (
              <span className="ml-1 font-semibold text-blue-600">
                - Ej: {getIndicatorThreshold(indicator.name)}
              </span>
            )}
          </label>
          <input
            type="text"
            value={thresholdValue}
            onChange={(e) => onThresholdChange(indicator.id, e.target.value)}
            placeholder={getIndicatorThreshold(indicator.name) || "Ingrese el umbral"}
            className={
              "w-full rounded border px-2 py-1 text-xs border-slate-200 focus:border-blue-500 focus:ring-blue-200"
            }
          />
        </div>
      </div>
      <p className="text-[11px] text-slate-500">
        Define un valor de referencia para este indicador en las unidades que
        manejes habitualmente.
      </p>
    </div>
  );
}
