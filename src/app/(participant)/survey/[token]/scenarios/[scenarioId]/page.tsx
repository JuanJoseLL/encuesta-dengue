"use client";

import { use, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProgressBar } from "@/components/common/ProgressBar";
import { mockApi } from "@/lib/mock/api";
import { MOCK_SCENARIOS, MOCK_INDICATORS } from "@/lib/mock/data";
import type { Indicator, ScenarioDefinition } from "@/domain/models";

interface ScenarioPageParams {
  token: string;
  scenarioId: string;
}

export default function ScenarioWizardPage({ params }: { params: Promise<ScenarioPageParams> }) {
  const router = useRouter();
  const { token, scenarioId } = use(params);

  const [scenario, setScenario] = useState<ScenarioDefinition | null>(null);
  const [availableIndicators, setAvailableIndicators] = useState<Indicator[]>([]);
  const [selectedIndicators, setSelectedIndicators] = useState<Set<string>>(new Set());
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState("");

  // Cargar datos del escenario
  useEffect(() => {
    const currentScenario = MOCK_SCENARIOS.find((s) => s.id === scenarioId);
    if (!currentScenario) {
      setError("Escenario no encontrado");
      return;
    }

    setScenario(currentScenario);

    // Obtener indicadores disponibles para este escenario
    const indicatorIds = currentScenario.indicators.map((ind) => ind.indicatorId);
    const indicators = MOCK_INDICATORS.filter((ind) => indicatorIds.includes(ind.id));
    setAvailableIndicators(indicators);

    // Cargar progreso guardado
    const sessionKey = `session-session-${token}-${scenarioId}`;
    const stored = localStorage.getItem(sessionKey);
    if (stored) {
      const { weights: savedWeights } = JSON.parse(stored);
      setWeights(savedWeights);
      setSelectedIndicators(new Set(Object.keys(savedWeights)));
    }
  }, [token, scenarioId]);

  // Autosave con debounce
  useEffect(() => {
    if (Object.keys(weights).length === 0) return;

    const timeoutId = setTimeout(async () => {
      setSaving(true);
      try {
        await mockApi.saveDraft(`session-${token}`, scenarioId, weights);
        setLastSaved(new Date());
      } catch (err) {
        console.error("Error saving:", err);
      } finally {
        setSaving(false);
      }
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [weights, token, scenarioId]);

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
    setWeights((prev) => ({ ...prev, [indicatorId]: value }));
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

  const currentIndex = MOCK_SCENARIOS.findIndex((s) => s.id === scenarioId);
  const hasNext = currentIndex < MOCK_SCENARIOS.length - 1;
  const hasPrev = currentIndex > 0;

  const handleNext = () => {
    if (!isValid) {
      setError("Los pesos deben sumar exactamente 100% antes de continuar");
      return;
    }
    if (hasNext) {
      router.push(`/survey/${token}/scenarios/${MOCK_SCENARIOS[currentIndex + 1].id}`);
    } else {
      router.push(`/survey/${token}/summary`);
    }
  };

  const handlePrev = () => {
    if (hasPrev) {
      router.push(`/survey/${token}/scenarios/${MOCK_SCENARIOS[currentIndex - 1].id}`);
    }
  };

  const filteredIndicators = availableIndicators.filter((ind) =>
    ind.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!scenario) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-slate-600">Cargando escenario...</div>
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
                href={`/survey/${token}/scenarios`}
                className="text-sm text-blue-600 hover:underline"
              >
                ← Volver a lista
              </Link>
              <span className="text-slate-300">|</span>
              <span className="text-sm text-slate-600">
                Escenario {currentIndex + 1} de {MOCK_SCENARIOS.length}
              </span>
            </div>
            <div className="text-xs text-slate-500">
              {saving ? "Guardando..." : lastSaved ? `Guardado ${lastSaved.toLocaleTimeString()}` : ""}
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-900">{scenario.title}</h1>
            <p className="mt-2 text-slate-600">{scenario.description}</p>
          </div>

          <ProgressBar
            value={(currentIndex + 1) / MOCK_SCENARIOS.length}
            label={`Progreso: ${currentIndex + 1}/${MOCK_SCENARIOS.length}`}
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
                Marca los indicadores más importantes para este escenario
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
                      <div className="mt-0.5 flex flex-wrap gap-1">
                        {indicator.domainTags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
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
                  {remaining > 0 ? `Faltan ${remaining.toFixed(1)}%` : remaining < 0 ? `Excedido por ${Math.abs(remaining).toFixed(1)}%` : "Suma correcta"}
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
                          step="0.1"
                          value={weights[indicatorId] || 0}
                          onChange={(e) => handleWeightChange(indicatorId, parseFloat(e.target.value) || 0)}
                          className="w-16 rounded border border-slate-200 px-2 py-1 text-xs text-right"
                        />
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="0.1"
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
            {isValid && <div className="text-sm text-green-600">Escenario completo</div>}
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
