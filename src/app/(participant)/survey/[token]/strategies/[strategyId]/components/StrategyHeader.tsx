import Link from "next/link";

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
}

export function StrategyHeader({
  strategy,
  token,
  currentIndex,
  totalStrategies,
  saving,
  lastSaved,
}: StrategyHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/survey/${token}/strategies`}
            className="text-sm text-blue-600 hover:underline"
          >
            ← Volver a lista
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

        {/* Instructions */}
        <div className="pt-4 border-t border-slate-200">
          <div className="flex items-start gap-2.5">
            <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-slate-600 leading-relaxed">
              Elija los indicadores que considera más útiles para activar esta estrategia. Luego, asigne un peso porcentual a cada uno, según su nivel de importancia. (Los pesos deben sumar 100% y se asignan en múltiplos de 5).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
