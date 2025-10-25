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
        setIsDataLoading(false);

        // Cargar progreso real de estrategias revisadas
        try {
          const progressResponse = await fetch(
            `/api/second-iteration/progress?sessionId=${session.id}`
          );
          if (progressResponse.ok) {
            const progressData = await progressResponse.json();
            setReviewedProgress(progressData.progress);
            
            // Verificar si esta estrategia específica está revisada
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

      // Actualizar progreso después de guardar
      try {
        const progressResponse = await fetch(
          `/api/second-iteration/progress?sessionId=${sessionId}`
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
    // Redondear a 2 decimales para evitar problemas de precisión de punto flotante
    const roundedValue = Math.round(clampedValue * 100) / 100;

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

  // Indicadores sin umbral (solo los que tienen peso > 0)
  const indicatorsWithoutThreshold = Object.values(userResponses).filter((r) => {
    const hasWeight = r.weight > 0;
    const hasThreshold = r.threshold && r.threshold.trim() !== '';
    return hasWeight && !hasThreshold;
  });

  // Indicadores con umbrales modificados (comparar con original)
  const indicatorsWithModifiedThresholds = Object.values(userResponses).filter((r) => {
    const original = originalResponses[r.indicatorId];
    if (!original) return false;
    
    const originalThreshold = original.threshold || '';
    const currentThreshold = r.threshold || '';
    return originalThreshold !== currentThreshold;
  });

  // Indicadores nuevos sin umbral (obligatorio para indicadores que no consideró originalmente)
  const newIndicatorsWithoutThreshold = Object.values(userResponses).filter((r) => {
    const isNew = !r.isOriginal;
    const hasWeight = r.weight > 0;
    const hasThreshold = r.threshold && r.threshold.trim() !== '';
    return isNew && hasWeight && !hasThreshold;
  });

  // Validaciones separadas
  const isWeightValid = Math.abs(totalWeight - 100) < 0.1;
  const hasRequiredThresholds = newIndicatorsWithoutThreshold.length === 0;
  const isValid = isWeightValid && hasRequiredThresholds;

  // Navegación
  const currentIndex = strategies.findIndex((s) => s.id === strategyId);

  const handleCompleteReview = async () => {
    if (!isWeightValid) {
      setError("Los pesos deben sumar exactamente 100% antes de continuar");
      return;
    }

    if (!hasRequiredThresholds) {
      const indicatorNames = newIndicatorsWithoutThreshold.map((r) => {
        const indicator = allIndicators.find((ind) => ind.id === r.indicatorId);
        return indicator?.name || r.indicatorId;
      }).join(", ");
      setError(`Debe definir umbrales para los siguientes indicadores: ${indicatorNames}`);
      return;
    }

    // Verificar si hay modificaciones
    const hasModifications = Object.values(userResponses).some((r) => {
      const original = originalResponses[r.indicatorId];
      if (!original) return false;
      
      const weightChanged = Math.abs(original.weight - r.weight) > 0.01;
      const thresholdChanged = (original.threshold || "") !== (r.threshold || "");
      
      return weightChanged || thresholdChanged;
    });

    // Si no hay modificaciones y la estrategia ya está revisada, continuar directamente
    if (!hasModifications && isStrategyReviewed) {
      await proceedToComplete();
      return;
    }

    // En todos los demás casos, mostrar modal de confirmación
    setShowConfirmModal(true);
  };

  // Función para marcar la estrategia como revisada
  const markStrategyAsReviewed = useCallback(async () => {
    if (!sessionId) return;

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
            markAsReviewed: true, // Flag para indicar que se debe marcar como revisada
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

      // Marcar la estrategia como revisada cuando se confirma
      await markStrategyAsReviewed();
      setIsStrategyReviewed(true);

      loadedStrategyIdRef.current = null;

      // Redirigir al listado de estrategias
      router.push(`/2ndIteration/${token}/strategies`);
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

  // Skeleton para cuando los datos están cargando
  if (isDataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-slate-50 px-6 py-12">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* Header skeleton */}
          <header className="space-y-4">
            <div className="h-8 bg-slate-200 rounded animate-pulse w-1/3"></div>
            <div className="h-4 bg-slate-200 rounded animate-pulse w-1/2"></div>
            <div className="h-2 bg-slate-200 rounded animate-pulse w-full"></div>
          </header>

          {/* Info banner skeleton */}
          <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-4">
            <div className="h-6 bg-slate-200 rounded animate-pulse w-1/4 mb-2"></div>
            <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4"></div>
          </div>

          {/* Cards skeleton */}
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
                  
                  <div className="rounded-md bg-slate-50 p-3 space-y-2">
                    <div className="h-3 bg-slate-200 rounded animate-pulse w-1/4"></div>
                    <div className="h-3 bg-slate-200 rounded animate-pulse w-1/3"></div>
                    <div className="h-4 bg-slate-200 rounded animate-pulse w-1/2"></div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="h-3 bg-slate-200 rounded animate-pulse w-1/2"></div>
                      <div className="h-6 w-16 bg-slate-200 rounded animate-pulse"></div>
                    </div>
                    <div className="h-2 bg-slate-200 rounded animate-pulse w-full"></div>
                  </div>

                  <div className="pt-2">
                    <div className="h-3 bg-slate-200 rounded animate-pulse w-1/4 mb-1"></div>
                    <div className="h-8 bg-slate-200 rounded animate-pulse w-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Loading spinner */}
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
          />

          <ProgressBar
            value={reviewedProgress}
            label={`Progreso: ${Math.round(reviewedProgress * 100)}%`}
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
                por al menos un experto, en la iteración anterior. Puede ver en una lista las ponderaciones de cada
                experto para este indicador y el promedio del grupo. Ajuste sus pesos y umbrales según
                considere. Recuerde que la idea es alcanzar un consenso final.
                (Los pesos deben sumar 100% y se asignan en múltiplos de 5).
              </p>
            </div>
          </div>
        </div>

        {/* Weight summary */}
        <div className="sticky top-0 z-99999 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
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
            Indicadores propuestos por usted y el grupo en la primera iteración
          </h2>

          {/* Ordenar indicadores: primero los originales del usuario, luego los no considerados */}
          {(() => {
            const sortedIndicators = consolidatedIndicators.sort((a, b) => {
              const userResponseA = userResponses[a.indicatorId];
              const userResponseB = userResponses[b.indicatorId];
              
              // Si ambos son originales o ambos no son originales, mantener orden original
              if (userResponseA?.isOriginal === userResponseB?.isOriginal) {
                return 0;
              }
              
              // Los originales van primero
              if (userResponseA?.isOriginal && !userResponseB?.isOriginal) {
                return -1;
              }
              
              if (!userResponseA?.isOriginal && userResponseB?.isOriginal) {
                return 1;
              }
              
              return 0;
            });

            const originalIndicators = sortedIndicators.filter(consInd => 
              userResponses[consInd.indicatorId]?.isOriginal
            );
            const newIndicators = sortedIndicators.filter(consInd => 
              !userResponses[consInd.indicatorId]?.isOriginal
            );

            return (
              <>
                {/* Indicadores originales del usuario */}
                {originalIndicators.length > 0 && (
                  <>
                    <div className="mb-6">
                      <p className="text-sm text-slate-600">
                        Revise y ajuste sus ponderaciones y umbrales basándose en el promedio del grupo
                      </p>
                    </div>
                    {originalIndicators.map((consInd) => {
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
                  </>
                )}

                {/* Indicadores nuevos propuestos por otros expertos */}
                {newIndicators.length > 0 && (
                  <>
                    <div className="mt-8 mb-6">
                      <h3 className="text-lg font-medium text-slate-800 mb-2">
                        Indicadores propuestos por otros expertos
                      </h3>
                      <p className="text-sm text-slate-600">
                        Considere estos indicadores adicionales que otros expertos seleccionaron
                      </p>
                    </div>
                    {newIndicators.map((consInd) => {
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
                  </>
                )}
              </>
            );
          })()}

          {consolidatedIndicators.length === 0 && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
              <p className="text-slate-600">
                No hay indicadores seleccionados para esta estrategia.
              </p>
            </div>
          )}
        </div>

        {/* Navigation Footer */}
        <footer className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-center">
            {error && (
              <div className="text-sm text-red-600">{error}</div>
            )}
            {!error && isValid && (
              <div className="text-sm text-green-600">
                ✓ Suma de pesos correcta (100%) y umbrales completos
              </div>
            )}
            {!error && !isWeightValid && (
              <div className="text-sm text-amber-600">
                La suma debe ser 100% (actual: {totalWeight.toFixed(1)}%)
              </div>
            )}
            {!error && isWeightValid && !hasRequiredThresholds && (
              <div className="text-sm text-red-600">
                Debe definir umbrales para indicadores nuevos
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
                          {indicator?.name || r.indicatorId} (
                          {r.weight}%)
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

              {!isStrategyReviewed && indicatorsWithoutThreshold.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-slate-900 mb-2">
                    No ha definido umbrales para estos indicadores:
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 bg-slate-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                    {indicatorsWithoutThreshold.map((r) => {
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

              {!isStrategyReviewed && indicatorsWithModifiedThresholds.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-slate-900 mb-2">
                    Ha modificado los umbrales de estos indicadores:
                  </h4>
                  <p className="text-sm text-slate-600 mb-2">
                    Ha cambiado los umbrales que había definido originalmente para estos indicadores.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 bg-slate-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                    {indicatorsWithModifiedThresholds.map((r) => {
                      const indicator = allIndicators.find(
                        (ind) => ind.id === r.indicatorId
                      );
                      const original = originalResponses[r.indicatorId];
                      return (
                        <li key={r.indicatorId}>
                          {indicator?.name || r.indicatorId} ({r.weight}%)
                          <div className="text-xs text-slate-500 ml-4">
                            Original: "{original?.threshold || 'Sin umbral'}" → Actual: "{r.threshold || 'Sin umbral'}"
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {!isStrategyReviewed && newIndicatorsWithoutThreshold.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-red-900 mb-2">
                    ⚠️ Debe definir umbrales para estos indicadores nuevos:
                  </h4>
                  <p className="text-sm text-red-600 mb-2">
                    <strong>Obligatorio:</strong> Para los indicadores que no consideró en la primera iteración pero ahora está evaluando, debe definir un umbral.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 bg-red-50 rounded-lg p-4 max-h-48 overflow-y-auto border border-red-200">
                    {newIndicatorsWithoutThreshold.map((r) => {
                      const indicator = allIndicators.find(
                        (ind) => ind.id === r.indicatorId
                      );
                      return (
                        <li key={r.indicatorId} className="text-red-700">
                          <strong>{indicator?.name || r.indicatorId}</strong> ({r.weight}%)
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
                  disabled={newIndicatorsWithoutThreshold.length > 0}
                  className={`flex-1 rounded-full px-6 py-3 font-semibold ${
                    newIndicatorsWithoutThreshold.length > 0
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700 hover:cursor-pointer"
                  }`}
                >
                  {newIndicatorsWithoutThreshold.length > 0 
                    ? "Complete los umbrales obligatorios" 
                    : isStrategyReviewed 
                      ? "Guardar cambios" 
                      : "Completar revisión"
                  }
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

