import Link from "next/link";
import { useState } from "react";
import type { StrategyEvaluationMode, StrategyImportanceRating } from "../types";

interface StrategyHeaderProps {
  strategy: {
    order: number;
    metodo: string;
    codigo?: string;
    description?: string;
    objetivo?: string;
  };
  token: string;
  currentIndex: number;
  totalStrategies: number;
  saving: boolean;
  lastSaved: Date | null;
  basePath?: string; // Nueva prop opcional para definir la ruta base
  importanceRating?: StrategyImportanceRating | null;
  onRatingChange?: (rating: StrategyImportanceRating) => void;
  evaluationMode?: StrategyEvaluationMode;
  onSaveRating?: () => void; // Callback para guardar manualmente
}

export function StrategyHeader({
  strategy,
  token,
  currentIndex,
  totalStrategies,
  saving,
  lastSaved,
  basePath = "survey", // Por defecto usa "survey"
  importanceRating,
  onRatingChange,
  evaluationMode,
  onSaveRating,
}: StrategyHeaderProps) {
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);

  const ratings: Array<{ value: StrategyImportanceRating; label: string }> = [
    { value: 0, label: "0" },
    { value: 1, label: "1" },
    { value: 2, label: "2" },
    { value: 3, label: "3" },
    { value: 4, label: "4" },
    { value: 5, label: "5" },
  ];

  const handleSaveClick = () => {
    if (onSaveRating) {
      onSaveRating();
    }
    setShowSaveConfirmation(true);
    setTimeout(() => setShowSaveConfirmation(false), 2000);
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/${basePath}/${token}/strategies`}
            className="text-sm text-blue-600 hover:underline"
          >
            ← Volver a la lista de estrategias
          </Link>
          <span className="text-slate-300">|</span>
          <span className="text-sm text-slate-600">
            Estrategia {currentIndex + 1} de {totalStrategies}
          </span>
        </div>
        <div className="text-xs text-slate-500">
          {saving ? (
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
              Guardando...
            </span>
          ) : lastSaved ? (
            `Guardado ${lastSaved.toLocaleTimeString()}`
          ) : null}
        </div>
      </div>

      <div className="sticky top-0 z-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* Header: Title and Code */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
              {strategy.order}
            </span>
            <h1 className="text-2xl font-bold text-slate-900">
              {strategy.metodo}
            </h1>
          </div>

          {strategy.codigo && (
            <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md whitespace-nowrap">
              {strategy.codigo}
            </span>
          )}
        </div>

        {/* Description */}
        {strategy.description && (
          <p className="text-sm text-slate-600 mb-3 leading-relaxed">
            {strategy.description}
          </p>
        )}

        {/* Objective */}
        {strategy.objetivo && (
          <div className="mb-4">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
              Objetivo:{" "}
            </span>
            <span className="text-sm text-slate-600">
              {strategy.objetivo}
            </span>
          </div>
        )}

        {/* Importance Rating - Only show if not skipped */}
        {evaluationMode !== "skipped" && onRatingChange && (
          <div className="mt-5 pt-5 border-t border-slate-200">
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Califique la importancia de esta estrategia
                </h3>
                <p className="mt-1 text-xs text-slate-600">
                  Indique qué tan eficiente o importante considera esta estrategia
                  para la mitigación y/o control del dengue (0 = no es importante, 5 = extremadamente importante)
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {ratings.map(({ value, label }) => (
                    <label
                      key={value}
                      className={`flex items-center justify-center rounded-lg border-2 px-4 py-2 hover:cursor-pointer transition-all ${
                        importanceRating === value
                          ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold"
                          : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="importance-rating"
                        value={value}
                        checked={importanceRating === value}
                        onChange={() => onRatingChange(value)}
                        className="sr-only"
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>

                {importanceRating !== null && (
                  <button
                    onClick={handleSaveClick}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Confirmar calificación
                  </button>
                )}
              </div>

              {importanceRating !== null && !showSaveConfirmation && (
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <svg
                    className="h-4 w-4 text-slate-500"
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
                  <span>Calificación seleccionada: {importanceRating}/5. Presione "Confirmar calificación" para guardar.</span>
                </div>
              )}

              {showSaveConfirmation && (
                <div className="flex items-center gap-2 text-xs text-green-700 animate-fade-in">
                  <svg
                    className="h-4 w-4 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="font-medium">¡Calificación guardada correctamente!</span>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
