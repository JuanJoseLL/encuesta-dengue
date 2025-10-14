"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProgressBar } from "@/components/common/ProgressBar";
import { apiRoutes } from "@/lib/api/routes";
import type { Indicator } from "@/domain/models";

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
  const [availableIndicators, setAvailableIndicators] = useState<Indicator[]>(
    []
  );
  const [associatedIndicatorIds, setAssociatedIndicatorIds] = useState<number[]>(
    []
  );
  const [selectedIndicators, setSelectedIndicators] = useState<Set<string>>(
    new Set()
  );
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [sessionStatus, setSessionStatus] = useState<string>("draft");
  const [searchQuery, setSearchQuery] = useState("");
  const [additionalSearchQuery, setAdditionalSearchQuery] = useState("");
  const [showAssociatedIndicators, setShowAssociatedIndicators] = useState(true);
  const [showAdditionalIndicators, setShowAdditionalIndicators] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const autosaveInitializedRef = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadedStrategyIdRef = useRef<string | null>(null);
  const userMadeChangesRef = useRef(false);

  // Cargar datos de la estrategia
  useEffect(() => {
    // Solo cargar si es una estrategia diferente o la primera carga
    if (loadedStrategyIdRef.current === strategyId) {
      return;
    }

    async function loadStrategy() {
      setIsInitialLoad(true);
      autosaveInitializedRef.current = false;
      userMadeChangesRef.current = false; // Reset al cargar nueva estrategia
      
      try {
        // Get session
        const sessionResponse = await fetch(apiRoutes.sessionGet(token));
        if (!sessionResponse.ok) {
          throw new Error("Failed to load session");
        }
        const sessionData = await sessionResponse.json();
        const session = sessionData.session;
        setSessionId(session.id);
        setSessionStatus(session.status);

        // Permitir acceso a estrategias incluso si ya fue enviada
        // El experto puede seguir editando

        // Get indicators
        const indicatorsResponse = await fetch(
          apiRoutes.indicatorsGet({ active: true })
        );
        if (!indicatorsResponse.ok) {
          throw new Error("Failed to load indicators");
        }
        const indicatorsData = await indicatorsResponse.json();

        // Get session summary with strategies and responses
        const summaryResponse = await fetch(
          apiRoutes.sessionSummary(session.id)
        );
        if (!summaryResponse.ok) {
          throw new Error("Failed to load summary");
        }
        const summary = await summaryResponse.json();

        // Map items to strategies format
        const strategies = (summary.items || []).map((item: any) => ({
          id: item.strategyId,
          metodo: item.strategyMetodo,
          description: item.strategyDescription,
          order: item.strategyOrder,
          completed: item.status === "complete",
        }));
        setStrategies(strategies);

        // Find current strategy
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

        // Store associated indicator IDs
        setAssociatedIndicatorIds(currentStrategy.associatedIndicators);

        // Set all indicators available
        setAvailableIndicators(indicatorsData.indicators);

        // Solo establecer los pesos si el usuario NO ha hecho cambios durante la carga
        if (!userMadeChangesRef.current) {
          // Load saved weights from the indicators in the response
          const savedWeights: Record<string, number> = {};
          (currentItem.indicators || []).forEach((ind: any) => {
            savedWeights[ind.indicatorId] = ind.weight;
          });

          setWeights(savedWeights);
          setSelectedIndicators(new Set(Object.keys(savedWeights)));
        }
        
        // Marcar que esta estrategia ya fue cargada
        loadedStrategyIdRef.current = strategyId;
        setIsInitialLoad(false);
      } catch (err) {
        console.error("Error loading strategy:", err);
        setError("Error al cargar la estrategia");
        setIsInitialLoad(false);
      }
    }

    loadStrategy();
  }, [router, strategyId, token]);

  // Función para guardar cambios
  const saveChanges = useCallback(async () => {
    if (!sessionId) return;

    // Permitir guardar incluso si ya fue enviada

    setSaving(true);
    setHasUnsavedChanges(false);
    
    try {
      const payload = Object.entries(weights).map(
        ([indicatorId, weight]) => ({
          indicatorId,
          weight,
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
  }, [sessionId, sessionStatus, weights, strategyId, router, token]);

  // Autosave con debounce
  useEffect(() => {
    // No hacer autosave durante la carga inicial
    if (isInitialLoad || !sessionId) return;

    if (!autosaveInitializedRef.current) {
      autosaveInitializedRef.current = true;
      return;
    }

    // Marcar que hay cambios sin guardar
    setHasUnsavedChanges(true);

    // Limpiar timeout anterior si existe
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Configurar nuevo timeout
    saveTimeoutRef.current = setTimeout(() => {
      saveChanges();
    }, 1500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [weights, sessionId, strategyId, sessionStatus, saveChanges, isInitialLoad]);

  const handleToggleIndicator = (indicatorId: string) => {
    userMadeChangesRef.current = true; // Marcar que el usuario hizo cambios
    
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
    setError("");
  };

  const handleWeightChange = (indicatorId: string, value: number) => {
    userMadeChangesRef.current = true; // Marcar que el usuario hizo cambios
    
    // Limitar a 100 y redondear a múltiplos de 5
    const clampedValue = Math.min(100, Math.max(0, value));
    const roundedValue = Math.round(clampedValue / 5) * 5;

    // Calcular el máximo permitido
    const othersTotal = Object.entries(weights).reduce((sum, [id, weight]) => {
      if (id === indicatorId) {
        return sum;
      }
      return sum + weight;
    }, 0);
    const maxAllowed = Math.max(0, 100 - othersTotal);

    // Solo actualizar si el valor está dentro del límite
    if (roundedValue <= maxAllowed) {
      setWeights((prev) => ({
        ...prev,
        [indicatorId]: roundedValue,
      }));
      setError("");
    }
    // Si excede el límite, simplemente no hace nada (el slider no se mueve)
  };

  const handleAutoDistribute = () => {
    userMadeChangesRef.current = true; // Marcar que el usuario hizo cambios
    
    const selected = Array.from(selectedIndicators);
    if (selected.length === 0) return;

    const perItemBase = Math.floor(100 / selected.length / 5) * 5;
    const remainder = 100 - perItemBase * selected.length;
    const increments = Math.max(0, Math.floor(remainder / 5));

    const newWeights: Record<string, number> = {};
    selected.forEach((id, index) => {
      const extra = index < increments ? 5 : 0;
      newWeights[id] = perItemBase + extra;
    });

    // Ajuste fino si por redondeos no se completan 100
    const assignedTotal = Object.values(newWeights).reduce(
      (sum, w) => sum + w,
      0
    );
    let difference = 100 - assignedTotal;
    if (difference !== 0) {
      const step = difference > 0 ? 5 : -5;
      const ordered = [...selected];
      let idx = 0;
      while (difference !== 0 && ordered.length > 0) {
        const indicatorId = ordered[idx % ordered.length];
        const nextValue = (newWeights[indicatorId] ?? 0) + step;
        if (nextValue >= 0 && nextValue <= 100) {
          newWeights[indicatorId] = nextValue;
          difference -= step;
        } else {
          ordered.splice(idx % ordered.length, 1);
          continue;
        }
        idx += 1;
      }
    }

    setWeights(newWeights);
    setError("");
  };

  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
  const isValid =
    Math.abs(totalWeight - 100) < 0.1 && selectedIndicators.size > 0;
  const remaining = 100 - totalWeight;

  // Calcular progreso: contar estrategias completadas (excluyendo la actual) + la actual si está válida
  const currentCompletedCount = strategies.reduce((count, s) => {
    if (s.id === strategyId) {
      // Para la estrategia actual, usar el estado de validez actual
      return count + (isValid ? 1 : 0);
    }
    // Para las demás, usar el estado guardado
    return count + (s.completed ? 1 : 0);
  }, 0);

  const currentIndex = strategies.findIndex((s) => s.id === strategyId);
  const hasNext = currentIndex >= 0 && currentIndex < strategies.length - 1;
  const hasPrev = currentIndex > 0;

  const handleNext = async () => {
    if (!isValid) {
      setError("Los pesos deben sumar exactamente 100% antes de continuar");
      return;
    }

    try {
      setIsNavigating(true);
      
      // Si hay cambios sin guardar, guardarlos primero
      if (hasUnsavedChanges) {
        // Cancelar el timeout pendiente
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
          saveTimeoutRef.current = null;
        }
        
        // Guardar inmediatamente y esperar
        await saveChanges();
        
        // Pequeña espera para asegurar que se guardó
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // Resetear el estado de carga para permitir que la siguiente estrategia se cargue
      loadedStrategyIdRef.current = null;

      // Navegar después de guardar
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
      
      // Si hay cambios sin guardar, guardarlos primero
      if (hasUnsavedChanges) {
        // Cancelar el timeout pendiente
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
          saveTimeoutRef.current = null;
        }
        
        // Guardar inmediatamente y esperar
        await saveChanges();
        
        // Pequeña espera para asegurar que se guardó
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // Resetear el estado de carga para permitir que la estrategia anterior se cargue
      loadedStrategyIdRef.current = null;

      // Navegar después de guardar
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
    // Convertir el id del indicador (string) a número para comparar con los IDs asociados
    const indicatorNumericId = parseInt(ind.id);
    return associatedIndicatorIds.includes(indicatorNumericId);
  });

  const additionalIndicators = availableIndicators.filter((ind) => {
    const indicatorNumericId = parseInt(ind.id);
    return !associatedIndicatorIds.includes(indicatorNumericId);
  });

  const filteredAssociatedIndicators = associatedIndicators.filter((ind) =>
    ind.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAdditionalIndicators = additionalIndicators.filter((ind) =>
    ind.name.toLowerCase().includes(additionalSearchQuery.toLowerCase())
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
              {saving ? (
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                  Guardando...
                </span>
              ) : lastSaved ? (
                `Guardado ${lastSaved.toLocaleTimeString()}`
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                    {strategy.order}
                  </span>
                  <h1 className="text-2xl font-bold text-slate-900">
                    {strategy.metodo}
                  </h1>
                </div>

                {strategy.description && (
                  <p className="ml-11 text-sm text-slate-600 mb-3">
                    {strategy.description}
                  </p>
                )}

                {strategy.objetivo && (
                  <div className="ml-11">
                    <span className="text-xs font-semibold text-slate-700">
                      Objetivo:{" "}
                    </span>
                    <span className="text-sm text-slate-600">
                      {strategy.objetivo}
                    </span>
                  </div>
                )}
              </div>

              {strategy.codigo && (
                <span className="inline-block text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg whitespace-nowrap">
                  {strategy.codigo}
                </span>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200">
              <p className="text-sm text-slate-600 font-medium">
                💡 Selecciona y pondera los indicadores más relevantes para
                decidir activar esta estrategia
              </p>
            </div>
          </div>

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
                <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-green-900">
                  ✓ Encuesta enviada
                </h3>
                <p className="mt-1 text-sm text-green-700">
                  Sus respuestas han sido registradas. Puede seguir editando sus ponderaciones si lo considera necesario. Los cambios se guardarán automáticamente.
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
            {/* Indicadores Asociados */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => {
                  setShowAssociatedIndicators(!showAssociatedIndicators);
                  if (!showAssociatedIndicators) {
                    setShowAdditionalIndicators(false);
                  }
                }}
              >
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Indicadores asociados a esta estrategia
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Seleccione y pondere los indicadores más relevantes que, según su
                    criterio, deben considerarse para decidir la activación de esta
                    estrategia de mitigación del Dengue.
                  </p>
                </div>
                <button className="ml-4 text-2xl text-slate-400 hover:text-slate-600 transition">
                  {showAssociatedIndicators ? "−" : "+"}
                </button>
              </div>

              {showAssociatedIndicators && (
                <>
                  {/* Search */}
                  <input
                    type="text"
                    placeholder="🔍 Buscar indicadores..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mt-4 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />

                  {/* Associated Indicators List */}
                  <div className="mt-4 max-h-[400px] space-y-2 overflow-y-auto">
                    {filteredAssociatedIndicators.map((indicator) => (
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
                    {filteredAssociatedIndicators.filter(ind => selectedIndicators.has(ind.id)).length} de {associatedIndicators.length} indicadores asociados seleccionados
                  </div>
                </>
              )}
            </div>

            {/* Indicadores Adicionales */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => {
                  setShowAdditionalIndicators(!showAdditionalIndicators);
                  if (!showAdditionalIndicators) {
                    setShowAssociatedIndicators(false);
                  }
                }}
              >
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Propuesta de Indicadores adicionales
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Si lo considera pertinente, incluya y asigne una ponderación a otros indicadores que deberían incorporarse para mejorar la evaluación y la aplicabilidad de esta estrategia.
                  </p>
                </div>
                <button className="ml-4 text-2xl text-slate-400 hover:text-slate-600 transition">
                  {showAdditionalIndicators ? "−" : "+"}
                </button>
              </div>

              {showAdditionalIndicators && (
                <>
                  {/* Search for additional indicators */}
                  <input
                    type="text"
                    placeholder="🔍 Buscar indicadores adicionales..."
                    value={additionalSearchQuery}
                    onChange={(e) => setAdditionalSearchQuery(e.target.value)}
                    className="mt-4 w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />

                  {/* Additional Indicators List */}
                  <div className="mt-4 max-h-[300px] space-y-2 overflow-y-auto">
                    {filteredAdditionalIndicators.map((indicator) => (
                      <label
                        key={indicator.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-3 transition ${
                          selectedIndicators.has(indicator.id)
                            ? "border-green-600 bg-green-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedIndicators.has(indicator.id)}
                          onChange={() => handleToggleIndicator(indicator.id)}
                          className="mt-0.5 h-4 w-4 text-green-600"
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
                    {filteredAdditionalIndicators.filter(ind => selectedIndicators.has(ind.id)).length} indicadores adicionales seleccionados
                  </div>
                </>
              )}
            </div>

            <div className="rounded-lg bg-blue-50 p-4 text-xs text-slate-700">
              <strong>Total:</strong> {selectedIndicators.size} indicador(es) seleccionado(s)
            </div>
          </div>

          {/* Right: Weight Panel */}
          <div className="space-y-4">
            <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">
                Asignación de pesos ponderados
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Asigne un peso porcentual (%) a cada indicador seleccionado. Los
                pesos se asignarán en intervalos de 5% y la suma total de los
                pesos asignados debe ser igual a 100%.
              </p>

              {/* Total Progress */}
              <div className="mt-4 rounded-lg bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">
                    Total asignado:
                  </span>
                  <span
                    className={`text-2xl font-bold ${
                      isValid
                        ? "text-green-600"
                        : totalWeight > 100
                        ? "text-red-600"
                        : "text-amber-600"
                    }`}
                  >
                    {totalWeight.toFixed(1)}%
                  </span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full transition-all ${
                      isValid
                        ? "bg-green-500"
                        : totalWeight > 100
                        ? "bg-red-500"
                        : "bg-amber-500"
                    }`}
                    style={{ width: `${Math.min(totalWeight, 100)}%` }}
                  />
                </div>
                <div className="mt-2 text-xs text-slate-600">
                  {remaining > 0
                    ? `Faltan ${remaining.toFixed(1)}%`
                    : remaining < 0
                    ? `Excedido por ${Math.abs(remaining).toFixed(1)}%`
                    : "Suma correcta ✓"}
                </div>
              </div>

              {/* Auto Distribute Button */}
              {selectedIndicators.size > 0 && (
                <button
                  onClick={handleAutoDistribute}
                  className="mt-4 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:cursor-pointer"
                >
                  Autorrepartir equitativamente
                </button>
              )}

              {/* Weight Sliders */}
              <div className="mt-4 max-h-[400px] space-y-3 overflow-y-auto">
                {Array.from(selectedIndicators).map((indicatorId) => {
                  const indicator = availableIndicators.find(
                    (ind) => ind.id === indicatorId
                  );
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
                          onChange={(e) =>
                            handleWeightChange(
                              indicatorId,
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-16 rounded border border-slate-200 px-2 py-1 text-xs text-right"
                        />
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={weights[indicatorId] || 0}
                        onChange={(e) =>
                          handleWeightChange(
                            indicatorId,
                            parseFloat(e.target.value)
                          )
                        }
                        onInput={(e) =>
                          handleWeightChange(
                            indicatorId,
                            parseFloat((e.target as HTMLInputElement).value)
                          )
                        }
                        onClick={(e) =>
                          handleWeightChange(
                            indicatorId,
                            parseFloat((e.target as HTMLInputElement).value)
                          )
                        }
                        className="w-full cursor-pointer"
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
            disabled={!hasPrev || isNavigating}
            className="rounded-full border border-slate-200 px-6 py-2 font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 hover:cursor-pointer"
          >
            ← Anterior
          </button>

          <div className="text-center">
            {error && !isNavigating && <div className="text-sm text-red-600">{error}</div>}
            {isNavigating && (
              <div className="text-sm text-blue-600 flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-full bg-blue-600 animate-ping"></span>
                Guardando cambios...
              </div>
            )}
            {!isNavigating && !error && isValid && (
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
