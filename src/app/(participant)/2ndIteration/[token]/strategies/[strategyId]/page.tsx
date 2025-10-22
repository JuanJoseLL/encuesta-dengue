"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProgressBar } from "@/components/common/ProgressBar";
import { apiRoutes } from "@/lib/api/routes";
import type { Indicator } from "@/domain/models";
import { StrategyHeader } from "@/app/(participant)/survey/[token]/strategies/[strategyId]/components/StrategyHeader";
import { ConsolidatedIndicatorCard } from "./components/ConsolidatedIndicatorCard";

interface SecondIterationPageParams {
  token: string;
  strategyId: string;
}

interface ConsolidatedIndicator {
  indicatorId: string;
  indicatorName: string;
  indicatorDescription: string | null;
  weights: number[];
  thresholds: string[];
  average: number;
  count: number;
  totalRespondents: number;
}

interface UserResponse {
  indicatorId: string;
  weight: number;
  threshold: string | null;
  excluded: boolean;
  isOriginal: boolean;
}

export default function SecondIterationStrategyPage({
  params,
}: {
  params: Promise<SecondIterationPageParams>;
}) {
  const router = useRouter();
  const { token, strategyId } = use(params);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [strategy, setStrategy] = useState<any>(null);
  const [strategies, setStrategies] = useState<any[]>([]);
  const [consolidatedIndicators, setConsolidatedIndicators] = useState<
    ConsolidatedIndicator[]
  >([]);
  const [allIndicators, setAllIndicators] = useState<Indicator[]>([]);
  const [userResponses, setUserResponses] = useState<
    Record<string, UserResponse>
  >({});
  const [originalResponses, setOriginalResponses] = useState<
    Record<string, UserResponse>
  >({}); // Para comparar si modificó los pesos
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showWeightWarning, setShowWeightWarning] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadedStrategyIdRef = useRef<string | null>(null);

  // Cargar datos
  useEffect(() => {
    if (loadedStrategyIdRef.current === strategyId) {
      return;
    }

    async function loadData() {
      setIsInitialLoad(true);

      try {
        // Cargar sesión
        const sessionResponse = await fetch(apiRoutes.sessionGet(token));
        if (!sessionResponse.ok) {
          throw new Error("Failed to load session");
        }
        const sessionData = await sessionResponse.json();
        const session = sessionData.session;
        setSessionId(session.id);

        // Cargar indicadores
        const indicatorsResponse = await fetch(
          apiRoutes.indicatorsGet({ active: true })
        );
        if (!indicatorsResponse.ok) {
          throw new Error("Failed to load indicators");
        }
        const indicatorsData = await indicatorsResponse.json();
        setAllIndicators(indicatorsData.indicators);

        // Cargar resumen de estrategias
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
        };
        setStrategy(currentStrategy);

        // Cargar datos consolidados (excluyendo los propios del usuario)
        const consolidatedResponse = await fetch(
          apiRoutes.secondIterationConsolidated(strategyId, session.id)
        );
        if (!consolidatedResponse.ok) {
          throw new Error("Failed to load consolidated data");
        }
        const consolidatedData = await consolidatedResponse.json();
        setConsolidatedIndicators(consolidatedData.indicators);

        // Cargar respuestas del usuario (o inicializarlas)
        const userResponsesResponse = await fetch(
          apiRoutes.secondIterationUserResponses(session.id, strategyId)
        );
        if (!userResponsesResponse.ok) {
          throw new Error("Failed to load user responses");
        }
        const userResponsesData = await userResponsesResponse.json();

        // Convertir a objeto indexado por indicatorId
        const responsesMap: Record<string, UserResponse> = {};
        userResponsesData.responses.forEach((r: any) => {
          responsesMap[r.indicatorId] = {
            indicatorId: r.indicatorId,
            weight: r.weight,
            threshold: r.threshold,
            excluded: r.excluded,
            isOriginal: r.isOriginal,
          };
        });

        // Agregar indicadores consolidados que no están en las respuestas del usuario
        consolidatedData.indicators.forEach((ind: ConsolidatedIndicator) => {
          if (!responsesMap[ind.indicatorId]) {
            responsesMap[ind.indicatorId] = {
              indicatorId: ind.indicatorId,
              weight: 0,
              threshold: null,
              excluded: false,
              isOriginal: false,
            };
          }
        });

        setUserResponses(responsesMap);
        setOriginalResponses(JSON.parse(JSON.stringify(responsesMap))); // Copia profunda
        loadedStrategyIdRef.current = strategyId;
        setIsInitialLoad(false);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Error al cargar los datos");
        setIsInitialLoad(false);
      }
    }

    loadData();
  }, [strategyId, token]);

  // Guardar cambios
  const saveChanges = useCallback(async () => {
    if (!sessionId) return;

    setSaving(true);
    setHasUnsavedChanges(false);

    try {
      const responsesArray = Object.values(userResponses);

      const response = await fetch(
        apiRoutes.secondIterationUserResponses(sessionId, strategyId),
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            responses: responsesArray,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save responses");
      }

      setLastSaved(new Date());
      setError("");
    } catch (err) {
      console.error("Error saving:", err);
      setError("Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  }, [sessionId, strategyId, userResponses]);

  // Autosave con debounce
  useEffect(() => {
    if (isInitialLoad || !sessionId) return;

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
  }, [userResponses, sessionId, strategyId, saveChanges, isInitialLoad]);

  // Handlers
  const handleWeightChange = useCallback((indicatorId: string, value: number) => {
    const clampedValue = Math.min(100, Math.max(0, value));
    const roundedValue = Math.round(clampedValue / 5) * 5;

    setUserResponses((prev) => {
      const others = Object.entries(prev).reduce((sum, [id, r]) => {
        if (id === indicatorId || r.excluded) return sum;
        return sum + r.weight;
      }, 0);

      const maxAllowed = Math.max(0, 100 - others);

      if (roundedValue <= maxAllowed) {
        return {
          ...prev,
          [indicatorId]: {
            ...prev[indicatorId],
            weight: roundedValue,
          },
        };
      }
      return prev;
    });

    setError("");
    setShowWeightWarning(false);
  }, []);

  const handleThresholdChange = useCallback(
    (indicatorId: string, value: string) => {
      setUserResponses((prev) => ({
        ...prev,
        [indicatorId]: {
          ...prev[indicatorId],
          threshold: value === "" ? null : value,
        },
      }));
    },
    []
  );

  const handleExcludedChange = useCallback(
    (indicatorId: string, excluded: boolean) => {
      setUserResponses((prev) => ({
        ...prev,
        [indicatorId]: {
          ...prev[indicatorId],
          excluded,
          weight: excluded ? 0 : prev[indicatorId].weight,
        },
      }));
    },
    []
  );

  // Calcular total y validación
  const totalWeight = Object.values(userResponses).reduce((sum, r) => {
    return sum + r.weight;
  }, 0);

  const indicatorsWithZeroWeight = Object.values(userResponses).filter(
    (r) => r.weight === 0
  );
  
  // Indicadores no modificados (comparar con respuesta original)
  // Excluir los que están en cero de esta lista
  const unmodifiedIndicators = Object.values(userResponses).filter((r) => {
    const original = originalResponses[r.indicatorId];
    const isUnmodified = original && original.weight === r.weight;
    const hasWeight = r.weight > 0; // Solo incluir si tiene peso asignado
    return isUnmodified && hasWeight;
  });

  // El botón siguiente se habilita solo cuando la suma es 100%
  const isValid = Math.abs(totalWeight - 100) < 0.1;

  // Navegación
  const currentIndex = strategies.findIndex((s) => s.id === strategyId);
  const hasNext = currentIndex >= 0 && currentIndex < strategies.length - 1;
  const hasPrev = currentIndex > 0;

  const handleNext = async () => {
    if (!isValid) {
      setError("Los pesos deben sumar exactamente 100% antes de continuar");
      return;
    }

    // Verificar si hay indicadores sin modificar o en cero
    const hasUnmodified = unmodifiedIndicators.length > 0;
    const hasZeros = indicatorsWithZeroWeight.length > 0;

    // Si hay indicadores sin modificar o en cero, mostrar modal de confirmación
    if (hasUnmodified || hasZeros) {
      setShowConfirmModal(true);
      return;
    }

    // Si no hay advertencias, continuar directamente
    await proceedToNext();
  };

  const proceedToNext = async () => {
    try {
      setShowConfirmModal(false);
      
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
          `/2ndIteration/${token}/strategies/${strategies[currentIndex + 1].id}`
        );
      } else {
        router.push(`/2ndIteration/${token}/strategies`);
      }
    } catch (error) {
      console.error("Error during navigation:", error);
      setError("Error al guardar antes de navegar");
    }
  };

  const handlePrev = async () => {
    try {
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
          `/2ndIteration/${token}/strategies/${strategies[currentIndex - 1].id}`
        );
      }
    } catch (error) {
      console.error("Error during navigation:", error);
      setError("Error al guardar antes de navegar");
    }
  };

  if (!strategy) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-slate-600">Cargando estrategia...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-slate-50 px-6 py-12">
      <div className="mx-auto max-w-5xl space-y-6">
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
            value={currentIndex / strategies.length}
            label={`Estrategia ${currentIndex + 1} de ${strategies.length}`}
          />
        </header>

        {/* Info banner */}
        <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-600"
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
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900">
                Revisión Colaborativa
              </h3>
              <p className="mt-1 text-sm text-blue-700">
                A continuación se muestran todos los indicadores seleccionados
                por al menos un experto. Puede ver las ponderaciones de cada
                persona y el promedio del grupo. Ajuste sus respuestas según
                considere o mantenga su postura original.
              </p>
            </div>
          </div>
        </div>

        {/* Weight summary */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">
              Peso total asignado:
            </span>
            <div className="flex items-center gap-3">
              <span
                className={`text-2xl font-bold ${
                  isValid
                    ? "text-green-600"
                    : Math.abs(totalWeight - 100) < 0.1
                    ? "text-amber-600"
                    : "text-red-600"
                }`}
              >
                {totalWeight.toFixed(1)}%
              </span>
              <span className="text-sm text-slate-500">/ 100%</span>
            </div>
          </div>
        </div>

        {/* Indicators list */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">
            Indicadores propuestos por el grupo
          </h2>

          {consolidatedIndicators.map((consInd) => {
            const indicator = allIndicators.find(
              (ind) => ind.id === consInd.indicatorId
            );
            if (!indicator) return null;

            const userResponse = userResponses[consInd.indicatorId] || {
              indicatorId: consInd.indicatorId,
              weight: 0,
              threshold: null,
              excluded: false,
              isOriginal: false,
            };

            return (
              <ConsolidatedIndicatorCard
                key={indicator.id}
                indicator={indicator}
                consolidatedData={{
                  weights: consInd.weights,
                  average: consInd.average,
                  count: consInd.count,
                  thresholds: consInd.thresholds,
                }}
                userWeight={userResponse.weight}
                userThreshold={userResponse.threshold}
                excluded={userResponse.excluded}
                isOriginal={userResponse.isOriginal}
                onWeightChange={handleWeightChange}
                onThresholdChange={handleThresholdChange}
                onExcludedChange={handleExcludedChange}
                showWeightWarning={showWeightWarning}
                allUserResponses={userResponses}
              />
            );
          })}

          {consolidatedIndicators.length === 0 && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
              <p className="text-slate-600">
                No hay indicadores seleccionados para esta estrategia.
              </p>
            </div>
          )}
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
            {error && (
              <div className="text-sm text-red-600">{error}</div>
            )}
            {!error && isValid && (
              <div className="text-sm text-green-600">
                ✓ Suma de pesos correcta (100%)
              </div>
            )}
            {!error && !isValid && (
              <div className="text-sm text-amber-600">
                La suma debe ser 100% (actual: {totalWeight.toFixed(1)}%)
              </div>
            )}
          </div>

          <button
            onClick={handleNext}
            disabled={!isValid}
            className="rounded-full bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {hasNext ? "Siguiente →" : "Finalizar →"}
          </button>
        </footer>

        {/* Modal de confirmación */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4">
            <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl">
              <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-amber-600"
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
              </div>
              <h3 className="text-xl font-semibold text-slate-900 text-center mb-4">
                ¿Está seguro de continuar?
              </h3>
              <p className="text-sm text-slate-600 text-start mb-6">
                Hemos detectado algunas observaciones antes de continuar:
              </p>

              {unmodifiedIndicators.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-slate-900 mb-2">
                    No ha modificado los pesos de estos indicadores:
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 bg-slate-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                    {unmodifiedIndicators.map((r) => {
                      const indicator = allIndicators.find(
                        (ind) => ind.id === r.indicatorId
                      );
                      return (
                        <li key={r.indicatorId}>
                          {indicator?.name || r.indicatorId} (
                          {r.weight}%)
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {indicatorsWithZeroWeight.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-slate-900 mb-2">
                    Sigue sin considerar estos indicadores:
                  </h4>
                  <p className="text-sm text-slate-600 mb-2">
                    Si continúa sin considerar estos indicadores, su ponderación final será 0%.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 bg-slate-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                    {indicatorsWithZeroWeight.map((r) => {
                      const indicator = allIndicators.find(
                        (ind) => ind.id === r.indicatorId
                      );
                      return (
                        <li key={r.indicatorId}>
                          {indicator?.name || r.indicatorId}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 rounded-full border-2 border-slate-200 px-6 py-3 font-medium text-slate-700 hover:bg-slate-50 hover:cursor-pointer"
                >
                  Seguir editando
                </button>
                <button
                  onClick={proceedToNext}
                  className="flex-1 rounded-full bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 hover:cursor-pointer"
                >
                  Continuar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

