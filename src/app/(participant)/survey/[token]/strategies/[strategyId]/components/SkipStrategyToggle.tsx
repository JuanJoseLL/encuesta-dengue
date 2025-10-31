import type { StrategyEvaluationMode } from "../types";

interface SkipStrategyToggleProps {
  evaluationMode: StrategyEvaluationMode;
  onToggle: (mode: StrategyEvaluationMode) => void;
}

export function SkipStrategyToggle({
  evaluationMode,
  onToggle,
}: SkipStrategyToggleProps) {
  const isSkipped = evaluationMode === "skipped";

  return (
    <div className="rounded-xl border-2 border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <input
          type="checkbox"
          id="skip-strategy"
          checked={isSkipped}
          onChange={(e) => onToggle(e.target.checked ? "skipped" : "weighted")}
          className="mt-1 h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:cursor-pointer"
        />
        <div className="flex-1">
          <label
            htmlFor="skip-strategy"
            className="block text-sm font-semibold text-slate-900 hover:cursor-pointer"
          >
            No me considero experto en esta estrategia
          </label>
          <p className="mt-1 text-xs text-slate-600">
            Marque esta opción si no se siente calificado para ponderar los
            indicadores de esta estrategia. Podrá continuar con las demás
            estrategias sin problema.
          </p>
          {isSkipped && (
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <div className="flex items-start gap-2">
                <svg
                  className="h-5 w-5 flex-shrink-0 text-amber-600"
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
                <p className="text-xs text-amber-800">
                  <strong>Estrategia omitida:</strong> No se requerirá
                  ponderación de indicadores para esta estrategia. Esta
                  información será registrada en el envío final.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
