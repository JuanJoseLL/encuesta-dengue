import { IndicatorWeightDraft } from "@/domain/models";
import { ProgressBar } from "@/components/common/ProgressBar";
import { getRemainingWeight } from "@/lib/utils/weights";

interface WeightPanelProps {
  selected: Array<IndicatorWeightDraft & { name?: string }>;
  onAutoDistribute?: () => void;
  onCopyPrevious?: () => void;
}

export function WeightPanel({ selected, onAutoDistribute, onCopyPrevious }: WeightPanelProps) {
  const remaining = getRemainingWeight(selected);
  const progress = 1 - remaining / 100;
  return (
    <aside className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-900 p-6 text-sm text-white">
      <header className="space-y-2">
        <h2 className="text-lg font-semibold">Pesos asignados</h2>
        <p className="text-xs text-white/70">
          Asegúrate de distribuir el 100% entre los indicadores seleccionados antes de continuar.
        </p>
        <ProgressBar value={progress} size="sm" label="Total asignado" />
      </header>
      <div className="flex flex-col gap-3">
        {selected.length === 0 ? (
          <p className="rounded-xl bg-white/10 p-3 text-xs text-white/70">
            No hay indicadores seleccionados. Agrégalos desde el listado izquierdo.
          </p>
        ) : null}
        {selected.map((indicator) => (
          <div key={indicator.indicatorId} className="rounded-xl bg-white/10 p-3">
            <div className="flex items-center justify-between text-xs">
              <span>{indicator.name ?? indicator.indicatorId}</span>
              <span className="font-mono">{indicator.weight ?? 0}%</span>
            </div>
            {/* TODO: Vincular con estado controlado y validaciones (sumatoria 100%). */}
            <input type="range" min="0" max="100" step="1" className="mt-2 w-full" />
          </div>
        ))}
      </div>
      <div className="rounded-xl bg-white/10 p-3 text-xs">
        <p className="font-medium">Restante: {remaining}%</p>
        <div className="mt-2 flex gap-2">
          <button
            className="flex-1 rounded-full bg-white px-3 py-1 text-slate-900"
            onClick={onAutoDistribute}
          >
            Autorrepartir
          </button>
          <button
            className="flex-1 rounded-full border border-white/50 px-3 py-1 text-white"
            onClick={onCopyPrevious}
          >
            Copiar anterior
          </button>
        </div>
      </div>
    </aside>
  );
}
