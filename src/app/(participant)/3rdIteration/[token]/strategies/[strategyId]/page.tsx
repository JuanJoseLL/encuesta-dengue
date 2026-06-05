"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ProgressBar } from "@/components/common/ProgressBar";
import { apiRoutes } from "@/lib/api/routes";
import type { Indicator } from "@/domain/models";
import { StrategyHeader } from "@/app/(participant)/survey/[token]/strategies/[strategyId]/components/StrategyHeader";
import { getStrategyLeadTime } from "@/domain/constants/thirdIteration";
import { ConsolidatedIndicatorsTable } from "./components/ConsolidatedIndicatorsTable";
import { StrategyTimingBanner } from "./components/StrategyTimingBanner";

interface ThirdIterationPageParams {
  token: string;
  strategyId: string;
}

interface ConsolidatedIndicator {
  indicatorId: string;
  indicatorName: string;
  indicatorDescription: string | null;
  weights: number[];
  average: number;
  count: number;
  totalRespondents: number;
}

interface UserResponse {
  indicatorId: string;
  weight: number;
  excluded: boolean;
  isOriginal: boolean;
}

export default function ThirdIterationStrategyPage({
  params,
}: {
  params: Promise<ThirdIterationPageParams>;
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
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [reviewedProgress, setReviewedProgress] = useState(0);
  const [isStrategyReviewed, setIsStrategyReviewed] = useState(false);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadedStrategyIdRef = useRef<string | null>(null);

  // Cargar datos
  useEffect(() => {
    if (loadedStrategyIdRef.current === strategyId) {
      return;
    }

    async function loadData() {
      setIsInitialLoad(true);
      setIsDataLoading(true);

      try {
        const sessionResponse = await fetch(apiRoutes.sessionGet(token));
        if (!sessionResponse.ok) {
          throw new Error("Failed to load session");
        }
        const sessionData = await sessionResponse.json();
        const session = sessionData.session;
        setSessionId(session.id);

        const indicatorsResponse = await fetch(
          apiRoutes.indicatorsGet({ active: true })
        );
        if (!indicatorsResponse.ok) {
          throw new Error("Failed to load indicators");
        }
        const indicatorsData = await indicatorsResponse.json();
        setAllIndicators(indicatorsData.indicators);

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

        // Cargar datos consolidados (de la 2da iteración, excluyendo los propios)
        const consolidatedResponse = await fetch(
          apiRoutes.thirdIterationConsolidated(strategyId, session.id)
        );
        if (!consolidatedResponse.ok) {
          throw new Error("Failed to load consolidated data");
        }
        const consolidatedData = await consolidatedResponse.json();
        setConsolidatedIndicators(consolidatedData.indicators);

        // Cargar respuestas del usuario (o inicializarlas desde la 2da iteración)
        const userResponsesResponse = await fetch(
          apiRoutes.thirdIterationUserResponses(session.id, strategyId)
        );
        if (!userResponsesResponse.ok) {
          throw new Error("Failed to load user responses");
        }
        const userResponsesData = await userResponsesResponse.json();

        const responsesMap: Record<string, UserResponse> = {};
        userResponsesData.responses.forEach((r: any) => {
          responsesMap[r.indicatorId] = {
            indicatorId: r.indicatorId,
            weight: r.weight,
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
              excluded: false,
              isOriginal: false,
            };
          }
        });

        setUserResponses(responsesMap);
        setOriginalResponses(JSON.parse(JSON.stringify(responsesMap)));
        loadedStrategyIdRef.current = strategyId;
        setIsInitialLoad(false);
        setIsDataLoading(false);

        // Cargar progreso real de estrategias revisadas
        try {
          const progressResponse = await fetch(
            `/api/third-iteration/progress?sessionId=${session.id}`
          );
          if (progressResponse.ok) {
            const progressData = await progressResponse.json();
            setReviewedProgress(progressData.progress);

            const currentStrategyStatus = progressData.strategies.find(
              (s: any) => s.strategyId === strategyId
            );
            if (currentStrategyStatus && currentStrategyStatus.status === "reviewed") {
              setIsStrategyReviewed(true);
            }
          }
        } catch (error) {
          console.error("Error loading progress:", error);
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Error al cargar los datos");
        setIsInitialLoad(false);
        setIsDataLoading(false);
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
        apiRoutes.thirdIterationUserResponses(sessionId, strategyId),
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ responses: responsesArray }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save responses");
      }

      setLastSaved(new Date());
      setError("");

      try {
        const progressResponse = await fetch(
          `/api/third-iteration/progress?sessionId=${sessionId}`
        );
        if (progressResponse.ok) {
          const progressData = await progressResponse.json();
          setReviewedProgress(progressData.progress);
        }
      } catch (error) {
        console.error("Error updating progress:", error);
      }
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
    const roundedValue = Math.round(clampedValue);

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
  }, []);

  // Calcular total y validación
  const totalWeight = Object.values(userResponses).reduce((sum, r) => {
    return sum + r.weight;
  }, 0);

  const indicatorsWithZeroWeight = Object.values(userResponses).filter(
    (r) => r.weight === 0
  );

  // Indicadores no modificados (comparar con respuesta de la 2da iteración)
  const unmodifiedIndicators = Object.values(userResponses).filter((r) => {
    const original = originalResponses[r.indicatorId];
    const isUnmodified = original && original.weight === r.weight;
    const hasWeight = r.weight > 0;
    return isUnmodified && hasWeight;
  });

  // En la 3ra iteración solo validamos que los pesos sumen 100%
  const isWeightValid = Math.abs(totalWeight - 100) < 0.1;
  const isValid = isWeightValid;

  // Navegación
  const currentIndex = strategies.findIndex((s) => s.id === strategyId);

  const handleCompleteReview = async () => {
    if (!isWeightValid) {
      setError("Los pesos deben sumar exactamente 100% antes de continuar");
      return;
    }

    // Verificar si hay modificaciones respecto a la 2da iteración
    const hasModifications = Object.values(userResponses).some((r) => {
      const original = originalResponses[r.indicatorId];
      if (!original) return false;
      return Math.abs(original.weight - r.weight) > 0.01;
    });

    if (!hasModifications && isStrategyReviewed) {
      await proceedToComplete();
      return;
    }

    setShowConfirmModal(true);
  };

  const markStrategyAsReviewed = useCallback(async () => {
    if (!sessionId) return;

    try {
      const responsesArray = Object.values(userResponses);

      const response = await fetch(
        apiRoutes.thirdIterationUserResponses(sessionId, strategyId),
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            responses: responsesArray,
            markAsReviewed: true,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to mark strategy as reviewed");
      }
    } catch (err) {
      console.error("Error marking strategy as reviewed:", err);
      throw err;
    }
  }, [sessionId, strategyId, userResponses]);

  const proceedToComplete = async () => {
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

      await markStrategyAsReviewed();
      setIsStrategyReviewed(true);

      loadedStrategyIdRef.current = null;

      const currentStrategyIndex = strategies.findIndex((s) => s.id === strategyId);

      let nextStrategy = null;
      for (let i = currentStrategyIndex + 1; i < strategies.length; i++) {
        const progressResponse = await fetch(
          `/api/third-iteration/progress?sessionId=${sessionId}`
        );
        if (progressResponse.ok) {
          const progressData = await progressResponse.json();
          const strategyStatus = progressData.strategies.find(
            (s: any) => s.strategyId === strategies[i].id
          );

          if (strategyStatus && strategyStatus.status !== "reviewed") {
            nextStrategy = strategies[i];
            break;
          }
        }
      }

      if (!nextStrategy) {
        for (let i = 0; i < currentStrategyIndex; i++) {
          const progressResponse = await fetch(
            `/api/third-iteration/progress?sessionId=${sessionId}`
          );
          if (progressResponse.ok) {
            const progressData = await progressResponse.json();
            const strategyStatus = progressData.strategies.find(
              (s: any) => s.strategyId === strategies[i].id
            );

            if (strategyStatus && strategyStatus.status !== "reviewed") {
              nextStrategy = strategies[i];
              break;
            }
          }
        }
      }

      if (nextStrategy) {
        router.push(`/3rdIteration/${token}/strategies/${nextStrategy.id}`);
      } else {
        router.push(`/3rdIteration/${token}/strategies`);
      }
    } catch (error) {
      console.error("Error during completion:", error);
      setError("Error al guardar antes de completar");
    }
  };

  if (!strategy) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-slate-600">Cargando estrategia...</div>
      </div>
    );
  }

  if (isDataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-slate-50 px-6 py-12">
        <div className="mx-auto max-w-5xl space-y-6">
          <header className="space-y-4">
            <div className="h-8 bg-slate-200 rounded animate-pulse w-1/3"></div>
            <div className="h-4 bg-slate-200 rounded animate-pulse w-1/2"></div>
            <div className="h-2 bg-slate-200 rounded animate-pulse w-full"></div>
          </header>

          <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-4">
            <div className="h-6 bg-slate-200 rounded animate-pulse w-1/4 mb-2"></div>
            <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4"></div>
          </div>

          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="h-5 bg-slate-200 rounded animate-pulse w-1/3 mb-2"></div>
                      <div className="h-4 bg-slate-200 rounded animate-pulse w-1/2"></div>
                    </div>
                    <div className="h-6 w-16 bg-slate-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center py-8">
            <div className="flex items-center gap-2 text-slate-600">
              <div className="h-4 w-4 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
              <span>Cargando datos de la estrategia...</span>
            </div>
          </div>
        </div>
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
            basePath="3rdIteration"
            leadTime={getStrategyLeadTime(strategy.codigo)}
          />

          <ProgressBar
            value={reviewedProgress}
            label={`Progreso: ${Math.round(reviewedProgress * 100)}%`}
          />
        </header>

        {/* Info banner: encuadre + tiempo de la brigada + pregunta del peso */}
        <StrategyTimingBanner codigo={strategy.codigo} />

        {/* Weight summary */}
        <div className="sticky top-0 z-9999 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
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
                {Math.round(totalWeight)}%
              </span>
              <span className="text-sm text-slate-500">/ 100%</span>
            </div>
          </div>
        </div>

        {/* Indicators Table */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Indicadores propuestos por usted y el grupo en la iteración anterior
            </h2>
          </div>

          <ConsolidatedIndicatorsTable
            indicators={allIndicators}
            consolidatedIndicators={consolidatedIndicators}
            userResponses={userResponses}
            onWeightChange={handleWeightChange}
          />
        </div>

        {/* Navigation Footer */}
        <footer className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-center">
            {error && (
              <div className="text-sm text-red-600">{error}</div>
            )}
            {!error && isValid && (
              <div className="text-sm text-green-600">
                ✓ Suma de pesos correcta (100%)
              </div>
            )}
            {!error && !isWeightValid && (
              <div className="text-sm text-amber-600">
                La suma debe ser 100% (actual: {Math.round(totalWeight)}%)
              </div>
            )}
          </div>

          <button
            onClick={handleCompleteReview}
            disabled={!isValid}
            className="rounded-full bg-blue-600 px-8 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 hover:cursor-pointer"
          >
            Completar revisión de estrategia
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
                {isStrategyReviewed ? "¿Guardar cambios en estrategia revisada?" : "¿Está seguro de continuar?"}
              </h3>
              <p className="text-sm text-slate-600 text-start mb-6">
                {isStrategyReviewed
                  ? "Esta estrategia ya había sido revisada anteriormente. ¿Desea guardar los cambios realizados?"
                  : "Hemos detectado algunas observaciones antes de continuar:"
                }
              </p>

              {!isStrategyReviewed && unmodifiedIndicators.length > 0 && (
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
                          {indicator?.name || r.indicatorId} ({r.weight}%)
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {!isStrategyReviewed && indicatorsWithZeroWeight.length > 0 && (
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
                  {isStrategyReviewed ? "Cancelar" : "Seguir editando"}
                </button>
                <button
                  onClick={proceedToComplete}
                  className="flex-1 rounded-full px-6 py-3 font-semibold bg-blue-600 text-white hover:bg-blue-700 hover:cursor-pointer"
                >
                  {isStrategyReviewed ? "Guardar cambios" : "Completar revisión"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
