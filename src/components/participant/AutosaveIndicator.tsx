interface AutosaveIndicatorProps {
  state: "idle" | "saving" | "saved" | "error";
  lastSavedAt?: string;
}

const stateLabels: Record<AutosaveIndicatorProps["state"], string> = {
  idle: "Sin cambios recientes",
  saving: "Guardando…",
  saved: "Guardado automáticamente ✓",
  error: "Error al guardar",
};

const stateClasses: Record<AutosaveIndicatorProps["state"], string> = {
  idle: "text-slate-400",
  saving: "text-amber-600",
  saved: "text-emerald-600",
  error: "text-rose-600",
};

export function AutosaveIndicator({ state, lastSavedAt }: AutosaveIndicatorProps) {
  return (
    <div className={`text-xs font-medium ${stateClasses[state]}`}>
      {stateLabels[state]}
      {state === "saved" && lastSavedAt ? <span className="ml-1 text-slate-400">{lastSavedAt}</span> : null}
    </div>
  );
}
