import type { Indicator } from "@/domain/models";

interface IndicatorSelectorProps {
  title: string;
  description?: string;
  indicators: Indicator[];
  selectedIndicatorIds: Set<string>;
  onToggleIndicator: (indicatorId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  variant?: "associated" | "additional";
}

export function IndicatorSelector({
  title,
  description,
  indicators,
  selectedIndicatorIds,
  onToggleIndicator,
  searchQuery,
  onSearchChange,
  isExpanded,
  onToggleExpanded,
  variant = "associated",
}: IndicatorSelectorProps) {
  const selectedCount = indicators.filter((ind) =>
    selectedIndicatorIds.has(ind.id)
  ).length;

  const borderColor =
    variant === "associated" ? "border-blue-600" : "border-green-600";
  const bgColor = variant === "associated" ? "bg-blue-50" : "bg-green-50";
  const checkboxColor =
    variant === "associated" ? "text-blue-600" : "text-green-600";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={onToggleExpanded}
      >
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          {description && (
            <p className="mt-1 text-sm text-slate-600">{description}</p>
          )}
        </div>
        <button className="ml-4 text-2xl text-slate-400 hover:text-slate-600 transition">
          {isExpanded ? "−" : "+"}
        </button>
      </div>

      {isExpanded && (
        <>
          {/* Search */}
          <input
            type="text"
            placeholder="🔍 Buscar indicadores..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="mt-4 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />

          {/* Indicators List */}
          <div className="mt-4 max-h-[400px] space-y-2 overflow-y-auto">
            {indicators.map((indicator) => (
              <label
                key={indicator.id}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-3 transition ${
                  selectedIndicatorIds.has(indicator.id)
                    ? `${borderColor} ${bgColor}`
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedIndicatorIds.has(indicator.id)}
                  onChange={() => onToggleIndicator(indicator.id)}
                  className={`mt-0.5 h-4 w-4 ${checkboxColor}`}
                />
                <div className="flex-1">
                  <div className="font-medium text-slate-900">
                    {indicator.name}
                  </div>
                  {indicator.description && (
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                      {indicator.description}
                    </p>
                  )}
                </div>
              </label>
            ))}
          </div>

          <div className="mt-4 text-xs text-slate-500">
            {variant === "associated"
              ? `${selectedCount} de ${indicators.length} indicadores asociados seleccionados`
              : `${selectedCount} indicadores adicionales seleccionados`}
          </div>
        </>
      )}
    </div>
  );
}
