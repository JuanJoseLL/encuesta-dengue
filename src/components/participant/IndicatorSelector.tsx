interface IndicatorSelectorProps {
  indicators: { id: string; name: string; description?: string }[];
  onSelect?: (id: string) => void;
}

export function IndicatorSelector({ indicators, onSelect }: IndicatorSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-slate-800">Indicadores sugeridos</label>
      <input
        type="search"
        placeholder="Buscar indicadores"
        className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
      />
      <ul className="space-y-3 text-sm text-slate-700">
        {indicators.map((indicator) => (
          <li
            key={indicator.id}
            className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
          >
            <div>
              <p className="font-medium text-slate-800">{indicator.name}</p>
              {indicator.description ? (
                <p className="text-xs text-slate-500">{indicator.description}</p>
              ) : null}
            </div>
            {/* TODO: Integrar selección real y manejar duplicados. */}
            <button
              className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white"
              onClick={() => onSelect?.(indicator.id)}
            >
              Añadir
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
