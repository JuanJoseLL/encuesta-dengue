"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProgressBar } from "@/components/common/ProgressBar";
import { apiRoutes } from "@/lib/api/routes";
import {
  PARTICIPANT_ROLES,
  PARTICIPANT_ROLE_LABELS,
} from "@/domain/constants/roles";

interface StrategyStatus {
  id: string;
  metodo: string;
  description?: string;
  objetivo?: string;
  codigo?: string;
  order: number;
  completed: boolean;
  status: "complete" | "incomplete" | "empty";
  indicatorCount: number;
}

export default function StrategyOverviewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const router = useRouter();
  const { token } = use(params);
  const [strategies, setStrategies] = useState<StrategyStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState<string>("draft");
  const [respondentRole, setRespondentRole] = useState<string | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadProgress() {
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

        // Cargar el rol del respondente si existe
        if (session.respondent?.role) {
          setRespondentRole(session.respondent.role);
          setSelectedRole(session.respondent.role);
        }

        // Get session summary with strategies
        const summaryResponse = await fetch(
          apiRoutes.sessionSummary(session.id)
        );
        if (!summaryResponse.ok) {
          throw new Error("Failed to load summary");
        }
        const summary = await summaryResponse.json();

        // Map strategies with their status
        const strategiesWithStatus = (summary.items || []).map((item: any) => {
          const completed = item.status === "complete";
          const status: "complete" | "incomplete" | "empty" =
            item.status === "complete"
              ? "complete"
              : item.status === "not-applicable"
              ? "empty"
              : "incomplete";

          return {
            id: item.strategyId,
            metodo: item.strategyMetodo,
            description: item.strategyDescription,
            objetivo: item.strategyObjetivo,
            codigo: item.strategyCodigo,
            order: item.strategyOrder,
            completed,
            status,
            indicatorCount: item.indicatorCount || 0,
          };
        });

        setStrategies(strategiesWithStatus);

        // Calculate global progress
        const completedCount = strategiesWithStatus.filter(
          (s: StrategyStatus) => s.completed
        ).length;
        setProgress(completedCount / strategiesWithStatus.length);
      } catch (error) {
        console.error("Error loading progress:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProgress();
  }, [token]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-slate-600">Cargando estrategias...</div>
      </div>
    );
  }

  const completedCount = strategies.filter((s) => s.completed).length;
  const canSubmit =
    completedCount === strategies.length && strategies.length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;

    // Si el respondente ya tiene un rol, ir directamente a confirmación
    if (respondentRole) {
      setShowConfirmModal(true);
    } else {
      // Si no tiene rol, pedir que lo seleccione
      setShowRoleModal(true);
    }
  };

  const handleRoleSelected = () => {
    if (!selectedRole) {
      alert("Por favor seleccione su rol profesional");
      return;
    }
    setShowRoleModal(false);
    setShowConfirmModal(true);
  };

  const confirmSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await fetch(apiRoutes.sessionSubmit(sessionId!), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: selectedRole }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error al enviar:", errorData);

        // Si ya fue enviada, actualizar estado y cerrar modal
        if (errorData.error === "Session already submitted") {
          setSessionStatus("submitted");
          setShowConfirmModal(false);
          setShowRoleModal(false);
          return;
        }

        // Mostrar mensaje específico del error
        if (
          errorData.incompleteStrategies &&
          errorData.incompleteStrategies.length > 0
        ) {
          alert(
            `Hay ${errorData.incompleteStrategies.length} estrategia(s) incompleta(s). Por favor completa todas las estrategias con pesos que sumen 100%.`
          );
        } else {
          alert(
            errorData.error ||
              "Error al enviar la encuesta. Por favor intenta nuevamente."
          );
        }
        return;
      }

      router.push(`/survey/${token}/success`);
    } catch (error) {
      alert("Error de conexión. Por favor intenta nuevamente.");
      console.error(error);
    } finally {
      setSubmitting(false);
      setShowConfirmModal(false);
    }
  };

  // No bloquear la vista si está submitted, permitir ver y editar las estrategias

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-slate-50 px-6 py-12">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <header className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Estrategias de mitigación del Dengue
              </h1>
              <p className="mt-2 text-slate-600">
                Seleccione los indicadores más importantes para cada estrategia de respuesta al dengue y asígnele un peso porcentual a cada uno. Recuerde que los pesos deben sumar 100%. 
                
              </p>
              <p className="mt-1 text-sm italic text-slate-500">
                Su progreso se guardará automáticamente, por lo que podrá continuar en cualquier momento.
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                {completedCount}/{strategies.length}
              </div>
              <div className="text-sm text-slate-600">completadas</div>
            </div>
          </div>
          <ProgressBar
            value={progress}
            label={`Progreso global: ${Math.round(progress * 100)}%`}
          />
        </header>

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            href={`/survey/${token}/summary`}
            className="rounded-full border-2 border-slate-200 bg-white px-6 py-2.5 font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Ver resumen completo
          </Link>
          {canSubmit && sessionStatus !== "submitted" && (
            <button
              onClick={handleSubmit}
              className="rounded-full bg-green-600 px-6 py-2.5 font-semibold text-white transition hover:bg-green-700 hover:cursor-pointer"
            >
              Enviar encuesta final
            </button>
          )}
        </div>

        {/* Strategies Grid */}
        <section className="grid gap-4">
          {strategies.map((strategy) => (
            <Link
              key={strategy.id}
              href={`/survey/${token}/strategies/${strategy.id}`}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                      {strategy.order}
                    </span>
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600">
                        {strategy.metodo}
                      </h2>
                      {strategy.codigo && (
                        <span className="inline-block mt-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          {strategy.codigo}
                        </span>
                      )}
                    </div>
                  </div>

                  {strategy.objetivo && (
                    <div className="mb-2">
                      <span className="text-xs font-semibold text-slate-700">
                        Objetivo:{" "}
                      </span>
                      <span className="text-sm text-slate-600">
                        {strategy.objetivo}
                      </span>
                    </div>
                  )}

                  <div className="mt-3 flex gap-2 text-xs text-slate-500">
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                      {strategy.indicatorCount} indicadores disponibles
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
                      strategy.status === "complete"
                        ? "bg-green-100 text-green-700"
                        : strategy.status === "incomplete"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {strategy.status === "complete"
                      ? "Ponderación completa"
                      : strategy.status === "incomplete"
                      ? "Pendiente incompleta"
                      : "Pendiente de ponderación"}
                  </span>
                  <span className="text-xs text-blue-600 group-hover:underline">
                    {strategy.completed ? "Editar →" : "Completar →"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </section>

        
        

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl">
              <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
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
              <h3 className="text-xl font-semibold text-slate-900 text-center">
                ¿Confirmar que completó la encuesta?
              </h3>
              <p className="mt-3 text-sm text-slate-600 text-center">
                Confirme que ha terminado de ponderar todas las estrategias.
                Podrá seguir editando sus respuestas después si lo necesita.
              </p>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={submitting}
                  className="flex-1 rounded-full border border-slate-200 px-6 py-3 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 hover:cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmSubmit}
                  disabled={submitting}
                  className="flex-1 rounded-full bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 hover:cursor-pointer"
                >
                  {submitting ? "Enviando..." : "Sí, enviar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
