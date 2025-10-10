"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProgressBar } from "@/components/common/ProgressBar";
import { apiRoutes } from "@/lib/api/routes";
import type { Indicator } from "@/domain/models";

interface StrategyPageParams {
  token: string;
  strategyId: string;
}

export default function StrategyWizardPage({ params }: { params: Promise<StrategyPageParams> }) {
  const router = useRouter();
  const { token, strategyId } = use(params);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [strategy, setStrategy] = useState<any>(null);
  const [strategies, setStrategies] = useState<any[]>([]);
  const [availableIndicators, setAvailableIndicators] = useState<Indicator[]>([]);
  const [selectedIndicators, setSelectedIndicators] = useState<Set<string>>(new Set());
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState("");

  // Cargar datos de la estrategia
  useEffect(() => {
    async function loadStrategy() {
      try {
        // Get session
        const sessionResponse = await fetch(apiRoutes.sessionGet(token));
        if (!sessionResponse.ok) {
          throw new Error("Failed to load session");
        }
        const sessionData = await sessionResponse.json();
        const session = sessionData.session;
        setSessionId(session.id);

        // Get indicators
        const indicatorsResponse = await fetch(apiRoutes.indicatorsGet({ active: true }));
        if (!indicatorsResponse.ok) {
          throw new Error("Failed to load indicators");
        }
        const indicatorsData = await indicatorsResponse.json();

        // Get session summary with strategies and responses
        const summaryResponse = await fetch(apiRoutes.sessionSummary(session.id));
        if (!summaryResponse.ok) {
          throw new Error("Failed to load summary");
        }
        const summary = await summaryResponse.json();

        // Map items to strategies format
        const strategies = (summary.items || []).map((item: any) => ({
          id: item.strategyId,
          title: item.strategyTitle,
          description: item.strategyDescription,
          order: item.strategyOrder,
        }));
        setStrategies(strategies);

        // Find current strategy
        const currentItem = summary.items.find((item: any) => item.strategyId === strategyId);
        if (!currentItem) {
          setError("Estrategia no encontrada");
          return;
        }

        const currentStrategy = {
          id: currentItem.strategyId,
          title: currentItem.strategyTitle,
          description: currentItem.strategyDescription,
          order: currentItem.strategyOrder,
        };
        setStrategy(currentStrategy);

        // For now, use all indicators (we can filter later if needed)
        setAvailableIndicators(indicatorsData.indicators);

        // Load saved weights from the indicators in the response
        const savedWeights: Record<string, number> = {};
        (currentItem.indicators || []).forEach((ind: any) => {
          savedWeights[ind.indicatorId] = ind.weight;
        });
        
        setWeights(savedWeights);
        setSelectedIndicators(new Set(Object.keys(savedWeights)));
      } catch (err) {
        console.error("Error loading strategy:", err);
        setError("Error al cargar la estrategia");
      }
    }

    loadStrategy();
  }, [token, strategyId]);

  // Autosave con debounce
  useEffect(() => {
    if (!sessionId || Object.keys(weights).length === 0) return;

    const timeoutId = setTimeout(async () => {
      setSaving(true);
      try {
        const response = await fetch(apiRoutes.sessionDraft(sessionId), {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            strategyId,
            weights: Object.entries(weights).map(([indicatorId, weight]) => ({
              indicatorId,
              weight,
            })),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error saving draft:", errorData);
          throw new Error("Failed to save draft");
        }

        setLastSaved(new Date());
      } catch (err) {
        console.error("Error saving:", err);
      } finally {
        setSaving(false);
      }
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [weights, sessionId, strategyId]);

  const handleToggleIndicator = (indicatorId: string) => {
    const newSelected = new Set(selectedIndicators);
    const newWeights = { ...weights };

    if (newSelected.has(indicatorId)) {
      newSelected.delete(indicatorId);
      delete newWeights[indicatorId];
    } else {
      newSelected.add(indicatorId);
      newWeights[indicatorId] = 0;
    }

    setSelectedIndicators(newSelected);
    setWeights(newWeights);
  };

  const handleWeightChange = (indicatorId: string, value: number) => {
    // Limitar a 100 y redondear a múltiplos de 5
    const clampedValue = Math.min(100, Math.max(0, value));
    const roundedValue = Math.round(clampedValue / 5) * 5;
    setWeights((prev) => ({ ...prev, [indicatorId]: roundedValue }));
  };

  const handleAutoDistribute = () => {
    const selected = Array.from(selectedIndicators);
    if (selected.length === 0) return;

    const evenWeight = Math.floor(100 / selected.length);
    const remainder = 100 - evenWeight * selected.length;

    const newWeights: Record<string, number> = {};
    selected.forEach((id, index) => {
      newWeights[id] = evenWeight + (index < remainder ? 1 : 0);
    });

    setWeights(newWeights);
  };

  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
  const isValid = Math.abs(totalWeight - 100) < 0.1 && selectedIndicators.size > 0;
  const remaining = 100 - totalWeight;

  const currentIndex = strategies.findIndex((s) => s.id === strategyId);
  const hasNext = currentIndex >= 0 && currentIndex < strategies.length - 1;
  const hasPrev = currentIndex > 0;

  const handleNext = () => {
    if (!isValid) {
      setError("Los pesos deben sumar exactamente 100% antes de continuar");
      return;
    }
    if (hasNext) {
      router.push(`/survey/${token}/strategies/${strategies[currentIndex + 1].id}`);
    } else {
      router.push(`/survey/${token}/summary`);
    }
  };

  const handlePrev = () => {
    if (hasPrev) {
      router.push(`/survey/${token}/strategies/${strategies[currentIndex - 1].id}`);
    }
  };

  const filteredIndicators = availableIndicators.filter((ind) =>
    ind.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!strategy) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-slate-600">Cargando estrategia...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-slate-50 px-6 py-12">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <header className="space-y-4">
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
                Estrategia {currentIndex + 1} de {strategies.length}
              </span>
            </div>
            <div className="text-xs text-slate-500">
              {saving ? "Guardando..." : lastSaved ? `Guardado ${lastSaved.toLocaleTimeString()}` : ""}
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-900">{strategy.title}</h1>
            <p className="mt-2 text-slate-600">{strategy.description}</p>
            <p className="mt-1 text-sm text-blue-600">
              💡 Selecciona y pondera los indicadores más relevantes para decidir activar esta estrategia
            </p>
          </div>

          <ProgressBar
            value={(currentIndex + 1) / strategies.length}
            label={`Progreso: ${currentIndex + 1}/${strategies.length}`}
          />
        </header>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          {/* Left: Indicator Selector */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">
                Selecciona indicadores relevantes
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Marca los indicadores más importantes para esta estrategia de mitigación
              </p>

              {/* Search */}
              <input
                type="text"
                placeholder="🔍 Buscar indicadores..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mt-4 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />

              {/* Indicators List */}
              <div className="mt-4 max-h-[500px] space-y-2 overflow-y-auto">
                {filteredIndicators.map((indicator) => (
                  <label
                    key={indicator.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-3 transition ${
                      selectedIndicators.has(indicator.id)
                        ? "border-blue-600 bg-blue-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIndicators.has(indicator.id)}
                      onChange={() => handleToggleIndicator(indicator.id)}
                      className="mt-0.5 h-4 w-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">{indicator.name}</div>
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
                {selectedIndicators.size} indicador(es) seleccionado(s)
              </div>
            </div>
          </div>

          {/* Right: Weight Panel */}
          <div className="space-y-4">
            <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Asignar pesos</h2>
              <p className="mt-1 text-sm text-slate-600">Los pesos deben sumar 100%</p>

              {/* Total Progress */}
              <div className="mt-4 rounded-lg bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Total asignado:</span>
                  <span
                    className={`text-2xl font-bold ${
                      isValid ? "text-green-600" : totalWeight > 100 ? "text-red-600" : "text-amber-600"
                    }`}
                  >
                    {totalWeight.toFixed(1)}%
                  </span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full transition-all ${
                      isValid ? "bg-green-500" : totalWeight > 100 ? "bg-red-500" : "bg-amber-500"
                    }`}
                    style={{ width: `${Math.min(totalWeight, 100)}%` }}
                  />
                </div>
                <div className="mt-2 text-xs text-slate-600">
                  {remaining > 0 ? `Faltan ${remaining.toFixed(1)}%` : remaining < 0 ? `Excedido por ${Math.abs(remaining).toFixed(1)}%` : "Suma correcta ✓"}
                </div>
              </div>

              {/* Auto Distribute Button */}
              {selectedIndicators.size > 0 && (
                <button
                  onClick={handleAutoDistribute}
                  className="mt-4 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Autorrepartir equitativamente
                </button>
              )}

              {/* Weight Sliders */}
              <div className="mt-4 max-h-[400px] space-y-3 overflow-y-auto">
                {Array.from(selectedIndicators).map((indicatorId) => {
                  const indicator = availableIndicators.find((ind) => ind.id === indicatorId);
                  if (!indicator) return null;

                  return (
                    <div key={indicatorId} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-slate-700">
                          {indicator.name}
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="5"
                          value={weights[indicatorId] || 0}
                          onChange={(e) => handleWeightChange(indicatorId, parseFloat(e.target.value) || 0)}
                          className="w-16 rounded border border-slate-200 px-2 py-1 text-xs text-right"
                        />
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={weights[indicatorId] || 0}
                        onChange={(e) => handleWeightChange(indicatorId, parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  );
                })}
              </div>

              {selectedIndicators.size === 0 && (
                <div className="mt-4 text-center text-sm text-slate-500">
                  Selecciona al menos un indicador para asignar pesos
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Footer */}
        <footer className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <button
            onClick={handlePrev}
            disabled={!hasPrev}
            className="rounded-full border border-slate-200 px-6 py-2 font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ← Anterior
          </button>

          <div className="text-center">
            {error && <div className="text-sm text-red-600">{error}</div>}
            {isValid && <div className="text-sm text-green-600">✓ Estrategia completa</div>}
          </div>

          <button
            onClick={handleNext}
            disabled={!isValid}
            className="rounded-full bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {hasNext ? "Siguiente →" : "Ir al resumen →"}
          </button>
        </footer>
      </div>
    </div>
  );
}

