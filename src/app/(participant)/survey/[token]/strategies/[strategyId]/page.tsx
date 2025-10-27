"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProgressBar } from "@/components/common/ProgressBar";
import { apiRoutes } from "@/lib/api/routes";
import type { Indicator } from "@/domain/models";
import { StrategyHeader } from "./components/StrategyHeader";
import { IndicatorSelector } from "./components/IndicatorSelector";
import { WeightPanel } from "./components/WeightPanel";
import { useWeightManagement } from "./hooks/useWeightManagement";

interface StrategyPageParams {
  token: string;
  strategyId: string;
}

export default function StrategyWizardPage({
  params,
}: {
  params: Promise<StrategyPageParams>;
}) {
  const router = useRouter();
  const { token, strategyId } = use(params);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [strategy, setStrategy] = useState<any>(null);
  const [strategies, setStrategies] = useState<any[]>([]);
  const [availableIndicators, setAvailableIndicators] = useState<Indicator[]>([]);
  const [associatedIndicatorIds, setAssociatedIndicatorIds] = useState<number[]>([]);
  const [sessionStatus, setSessionStatus] = useState<string>("draft");
  const [searchQuery, setSearchQuery] = useState("");
  const [additionalSearchQuery, setAdditionalSearchQuery] = useState("");
  const [showAssociatedIndicators, setShowAssociatedIndicators] = useState(true);
  const [showAdditionalIndicators, setShowAdditionalIndicators] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const autosaveInitializedRef = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadedStrategyIdRef = useRef<string | null>(null);

  const {
    selectedIndicators,
    setSelectedIndicators,
    weights,
    setWeights,
    previousWeights,
    error,
    setError,
    showWeightWarning,
    setShowWeightWarning,
    userMadeChangesRef,
    handleToggleIndicator,
    handleWeightChange,
    handleThresholdChange,
    handleAutoDistribute,
    handleUndo,
    totalWeight,
    indicatorsWithZeroWeight,
    hasIndicatorsWithoutWeight,
    indicatorsWithoutThreshold,
    hasInvalidThresholds,
    isValid,
  } = useWeightManagement({ availableIndicators });

  // Cargar datos de la estrategia
  useEffect(() => {
    if (loadedStrategyIdRef.current === strategyId) {
      return;
    }

    async function loadStrategy() {
      setIsInitialLoad(true);
      autosaveInitializedRef.current = false;
      userMadeChangesRef.current = false;

      try {
        const sessionResponse = await fetch(apiRoutes.sessionGet(token));
        if (!sessionResponse.ok) {
          throw new Error("Failed to load session");
        }
        const sessionData = await sessionResponse.json();
        const session = sessionData.session;
        setSessionId(session.id);
        setSessionStatus(session.status);

        const indicatorsResponse = await fetch(
          apiRoutes.indicatorsGet({ active: true })
        );
        if (!indicatorsResponse.ok) {
          throw new Error("Failed to load indicators");
        }
        const indicatorsData = await indicatorsResponse.json();

        const summaryResponse = await fetch(
          apiRoutes.sessionSummary(session.id)
        );
        if (!summaryResponse.ok) {
          throw new Error("Failed to load summary");
        }
        const summary = await summaryResponse.json();

        const strategies = (summary.items || []).map((item: any) => ({
          id: item.strategyId,
          metodo: item.strategyMetodo,
          description: item.strategyDescription,
          order: item.strategyOrder,
          completed: item.status === "complete",
        }));
        setStrategies(strategies);

        const currentItem = summary.items.find(
          (item: any) => item.strategyId === strategyId
        );
        if (!currentItem) {
          setError("Estrategia no encontrada");
          setIsInitialLoad(false);
          return;
        }

        const currentStrategy = {
          id: currentItem.strategyId,
          metodo: currentItem.strategyMetodo,
          description: currentItem.strategyDescription,
          objetivo: currentItem.strategyObjetivo,
          codigo: currentItem.strategyCodigo,
          order: currentItem.strategyOrder,
          associatedIndicators: currentItem.strategyAssociatedIndicators || [],
        };
        setStrategy(currentStrategy);
        setAssociatedIndicatorIds(currentStrategy.associatedIndicators);
        setAvailableIndicators(indicatorsData.indicators);

        if (!userMadeChangesRef.current) {
          const savedWeights: Record<string, any> = {};
          (currentItem.indicators || []).forEach((ind: any) => {
            savedWeights[ind.indicatorId] = {
              weight: ind.weight ?? 0,
              threshold: ind.threshold ?? null,
            };
          });

          setWeights(savedWeights);
          setSelectedIndicators(new Set(Object.keys(savedWeights)));
        }

        loadedStrategyIdRef.current = strategyId;
        setIsInitialLoad(false);
      } catch (err) {
        console.error("Error loading strategy:", err);
        setError("Error al cargar la estrategia");
        setIsInitialLoad(false);
      }
    }

    loadStrategy();
  }, [router, strategyId, token, setWeights, setSelectedIndicators, userMadeChangesRef, setError]);

  // Función para guardar cambios
  const saveChanges = useCallback(async () => {
    if (!sessionId) return;

    setSaving(true);
    setHasUnsavedChanges(false);

    try {
      const payload = Object.entries(weights).map(
        ([indicatorId, allocation]) => ({
          indicatorId,
          weight: allocation.weight ?? 0,
          threshold: allocation.threshold ?? null,
        })
      );

      const response = await fetch(apiRoutes.sessionDraft(sessionId), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          strategyId,
          weights: payload,
          currentStrategyId: strategyId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error saving draft:", errorData);
        throw new Error("Failed to save draft");
      }

      setLastSaved(new Date());
      setError("");
    } catch (err) {
      console.error("Error saving:", err);
      setError("Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  }, [sessionId, weights, strategyId, setError]);

  // Autosave con debounce
  useEffect(() => {
    if (isInitialLoad || !sessionId) return;

    if (!autosaveInitializedRef.current) {
      autosaveInitializedRef.current = true;
      return;
    }

    setHasUnsavedChanges(true);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveChanges();
    }, 1500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [weights, sessionId, strategyId, saveChanges, isInitialLoad]);

  // Mostrar warning automáticamente cuando hay indicadores sin peso
  useEffect(() => {
    if (!hasIndicatorsWithoutWeight) {
      setShowWeightWarning(false);
    } else if (selectedIndicators.size > 0) {
      const timer = setTimeout(() => {
        setShowWeightWarning(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [hasIndicatorsWithoutWeight, selectedIndicators.size, setShowWeightWarning]);

  // Calcular progreso
  const currentCompletedCount = strategies.reduce((count, s) => {
    if (s.id === strategyId) {
      return count + (isValid ? 1 : 0);
    }
    return count + (s.completed ? 1 : 0);
  }, 0);

  const currentIndex = strategies.findIndex((s) => s.id === strategyId);
  const hasNext = currentIndex >= 0 && currentIndex < strategies.length - 1;
  const hasPrev = currentIndex > 0;

  const handleNext = async () => {
    if (hasIndicatorsWithoutWeight) {
      setShowWeightWarning(true);
      const indicatorNames = indicatorsWithZeroWeight
        .map((id) => {
          const ind = availableIndicators.find((i) => i.id === id);
          return ind ? ind.name : id;
        })
        .join(", ");
      setError(
        `Por favor, asigne un porcentaje a todos los indicadores seleccionados: ${indicatorNames}`
      );
      return;
    }

    if (hasInvalidThresholds) {
      const indicatorNames = indicatorsWithoutThreshold
        .map((id) => {
          const ind = availableIndicators.find((i) => i.id === id);
          return ind ? ind.name : id;
        })
        .join(", ");
      setError(
        `Por favor, defina un umbral para todos los indicadores seleccionados: ${indicatorNames}`
      );
      return;
    }

    if (!isValid) {
      setError("Los pesos deben sumar exactamente 100% antes de continuar");
      return;
    }

    try {
      setIsNavigating(true);

      if (hasUnsavedChanges) {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
          saveTimeoutRef.current = null;
        }
        await saveChanges();
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      loadedStrategyIdRef.current = null;

      if (hasNext) {
        router.push(
          `/survey/${token}/strategies/${strategies[currentIndex + 1].id}`
        );
      } else {
        router.push(`/survey/${token}/summary`);
      }
    } catch (error) {
      console.error("Error during navigation:", error);
      setError("Error al guardar antes de navegar");
      setIsNavigating(false);
    }
  };

  const handlePrev = async () => {
    try {
      setIsNavigating(true);

      if (hasUnsavedChanges) {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
          saveTimeoutRef.current = null;
        }
        await saveChanges();
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      loadedStrategyIdRef.current = null;

      if (hasPrev) {
        router.push(
          `/survey/${token}/strategies/${strategies[currentIndex - 1].id}`
        );
      }
    } catch (error) {
      console.error("Error during navigation:", error);
      setError("Error al guardar antes de navegar");
      setIsNavigating(false);
    }
  };

  // Dividir indicadores en asociados y adicionales
  const associatedIndicators = availableIndicators.filter((ind) => {
    const indicatorNumericId = parseInt(ind.id);
    return associatedIndicatorIds.includes(indicatorNumericId);
  });

  const additionalIndicators = availableIndicators.filter((ind) => {
    const indicatorNumericId = parseInt(ind.id);
    return !associatedIndicatorIds.includes(indicatorNumericId);
  });

  const filteredAssociatedIndicators = associatedIndicators.filter((ind) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    const name = ind.name.toLowerCase();
    const description = (ind.description || "").toLowerCase();

    return name.includes(query) || description.includes(query);
  });

  const filteredAdditionalIndicators = additionalIndicators.filter((ind) => {
    const query = additionalSearchQuery.toLowerCase().trim();
    if (!query) return true;

    const name = ind.name.toLowerCase();
    const description = (ind.description || "").toLowerCase();

    return name.includes(query) || description.includes(query);
  });

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
          <StrategyHeader
            strategy={strategy}
            token={token}
            currentIndex={currentIndex}
            totalStrategies={strategies.length}
            saving={saving}
            lastSaved={lastSaved}
          />

          <ProgressBar
            value={currentCompletedCount / strategies.length}
            label={`Progreso: ${currentCompletedCount}/${strategies.length} completadas`}
          />
        </header>

        {/* Banner informativo si ya fue enviada */}
        {sessionStatus === "submitted" && (
          <div className="rounded-xl border-2 border-green-200 bg-green-50 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-600"
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
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-green-900">
                  ✓ Encuesta enviada
                </h3>
                <p className="mt-1 text-sm text-green-700">
                  Sus respuestas han sido registradas. Puede seguir editando sus
                  ponderaciones si lo considera necesario. Los cambios se
                  guardarán automáticamente.
                </p>
              </div>
              <Link
                href={`/survey/${token}/summary`}
                className="flex-shrink-0 text-sm font-medium text-green-700 hover:text-green-800 underline"
              >
                Ver resumen
              </Link>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          {/* Left: Indicator Selector */}
          <div className="space-y-4">
            <IndicatorSelector
              title="Indicadores asociados a esta estrategia"
              indicators={filteredAssociatedIndicators}
              selectedIndicatorIds={selectedIndicators}
              onToggleIndicator={handleToggleIndicator}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              isExpanded={showAssociatedIndicators}
              onToggleExpanded={() => {
                setShowAssociatedIndicators(!showAssociatedIndicators);
                if (!showAssociatedIndicators) {
                  setShowAdditionalIndicators(false);
                }
              }}
              variant="associated"
            />

            <IndicatorSelector
              title="Propuesta de Indicadores adicionales"
              description="Si lo considera pertinente, incluya y asigne una ponderación a otros indicadores que deberían incorporarse para mejorar la evaluación y la aplicabilidad de esta estrategia."
              indicators={filteredAdditionalIndicators}
              selectedIndicatorIds={selectedIndicators}
              onToggleIndicator={handleToggleIndicator}
              searchQuery={additionalSearchQuery}
              onSearchChange={setAdditionalSearchQuery}
              isExpanded={showAdditionalIndicators}
              onToggleExpanded={() => {
                setShowAdditionalIndicators(!showAdditionalIndicators);
                if (!showAdditionalIndicators) {
                  setShowAssociatedIndicators(false);
                }
              }}
              variant="additional"
            />

            <div className="rounded-lg bg-blue-50 p-4 text-xs text-slate-700">
              <strong>Total:</strong> {selectedIndicators.size} indicador(es)
              seleccionado(s)
            </div>
          </div>

          {/* Right: Weight Panel */}
          <WeightPanel
            selectedIndicators={selectedIndicators}
            availableIndicators={availableIndicators}
            weights={weights}
            onWeightChange={handleWeightChange}
            onThresholdChange={handleThresholdChange}
            onAutoDistribute={handleAutoDistribute}
            onUndo={handleUndo}
            showWeightWarning={showWeightWarning}
            hasIndicatorsWithoutWeight={hasIndicatorsWithoutWeight}
            hasInvalidThresholds={hasInvalidThresholds}
            previousWeights={previousWeights}
            totalWeight={totalWeight}
            isValid={isValid}
          />
        </div>

        {/* Navigation Footer */}
        <footer className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <button
            onClick={handlePrev}
            disabled={!hasPrev || isNavigating}
            className="rounded-full border border-slate-200 px-6 py-2 font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 hover:cursor-pointer"
          >
            ← Anterior
          </button>

          <div className="text-center">
            {error && !isNavigating && (
              <div className="text-sm text-red-600">{error}</div>
            )}
            {!error && !isNavigating && hasIndicatorsWithoutWeight && (
              <div className="text-sm text-amber-600 flex items-center gap-2 justify-center">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                Asigne porcentaje a todos los indicadores seleccionados
              </div>
            )}
            {!error && !isNavigating && !hasIndicatorsWithoutWeight && hasInvalidThresholds && (
              <div className="text-sm text-amber-600 flex items-center gap-2 justify-center">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                Defina un umbral para todos los indicadores seleccionados
              </div>
            )}
            {isNavigating && (
              <div className="text-sm text-blue-600 flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-full bg-blue-600 animate-ping"></span>
                Guardando cambios...
              </div>
            )}
            {!isNavigating &&
              !error &&
              !hasIndicatorsWithoutWeight &&
              isValid && (
                <div className="text-sm text-green-600">
                  ✓ Estrategia completa
                </div>
              )}
          </div>

          <button
            onClick={handleNext}
            disabled={!isValid || isNavigating}
            className="rounded-full bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 hover:cursor-pointer"
          >
            {hasNext ? "Siguiente →" : "Ir al resumen →"}
          </button>
        </footer>
      </div>
    </div>
  );
}
