"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProgressBar } from "@/components/common/ProgressBar";
import { apiRoutes } from "@/lib/api/routes";
import { PARTICIPANT_ROLES, PARTICIPANT_ROLE_LABELS } from "@/domain/constants/roles";

interface StrategyStatus {
  id: string;
  title: string;
  description: string;
  order: number;
  completed: boolean;
  indicatorCount: number;
}

export default function StrategyOverviewPage({ params }: { params: Promise<{ token: string }> }) {
  const router = useRouter();
  const { token } = use(params);
  const [strategies, setStrategies] = useState<StrategyStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState<string>("draft");
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

        // Get session summary with strategies
        const summaryResponse = await fetch(apiRoutes.sessionSummary(session.id));
        if (!summaryResponse.ok) {
          throw new Error("Failed to load summary");
        }
        const summary = await summaryResponse.json();

        // Map strategies with their status
        const strategiesWithStatus = (summary.items || []).map((item: any) => {
          const completed = item.status === "complete";
          
          return {
            id: item.strategyId,
            title: item.strategyTitle,
            description: item.strategyDescription || "",
            order: item.strategyOrder,
            completed,
            indicatorCount: item.indicatorCount || 0,
          };
        });

        setStrategies(strategiesWithStatus);

        // Calculate global progress
        const completedCount = strategiesWithStatus.filter((s: StrategyStatus) => s.completed).length;
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
  const canSubmit = completedCount === strategies.length && strategies.length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setShowRoleModal(true);
  };

  const handleRoleSelected = () => {
    if (!selectedRole) {
      alert("Por favor selecciona tu rol profesional");
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
        if (errorData.incompleteStrategies && errorData.incompleteStrategies.length > 0) {
          alert(`Hay ${errorData.incompleteStrategies.length} estrategia(s) incompleta(s). Por favor completa todas las estrategias con pesos que sumen 100%.`);
        } else {
          alert(errorData.error || "Error al enviar la encuesta. Por favor intenta nuevamente.");
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

  // Si la sesión ya fue enviada, mostrar mensaje
  if (sessionStatus === "submitted") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-slate-50 px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border-2 border-green-200 bg-white p-8 text-center shadow-lg">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Encuesta ya enviada</h1>
            <p className="mt-3 text-slate-600">
              Ya has completado y enviado esta encuesta. Gracias por tu participación.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-full bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-slate-50 px-6 py-12">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <header className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Estrategias de mitigación</h1>
              <p className="mt-2 text-slate-600">
                Pondera los indicadores más relevantes para cada estrategia. Tu progreso se guarda automáticamente.
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                {completedCount}/{strategies.length}
              </div>
              <div className="text-sm text-slate-600">completadas</div>
            </div>
          </div>
          <ProgressBar value={progress} label={`Progreso global: ${Math.round(progress * 100)}%`} />
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
              className="rounded-full bg-green-600 px-6 py-2.5 font-semibold text-white transition hover:bg-green-700"
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
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                      {strategy.order}
                    </span>
                    <h2 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600">
                      {strategy.title}
                    </h2>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{strategy.description}</p>
                  <div className="mt-3 flex gap-2 text-xs text-slate-500">
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                      {strategy.indicatorCount} indicadores disponibles
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
                      strategy.completed
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {strategy.completed ? "Completada" : "Pendiente"}
                  </span>
                  <span className="text-xs text-blue-600 group-hover:underline">
                    {strategy.completed ? "Revisar →" : "Completar →"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </section>

        {/* Help Card */}
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6">
          <h3 className="font-semibold text-slate-900">💡 Sobre la encuesta</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>• Cada estrategia requiere ponderar los indicadores más relevantes para su activación</li>
            <li>• Los pesos indican la importancia relativa de cada indicador para tomar la decisión</li>
            <li>• Puedes completar las estrategias en cualquier orden</li>
            <li>• Los cambios se guardan automáticamente cada pocos segundos</li>
            <li>• Asegúrate que los pesos sumen exactamente 100% antes de avanzar</li>
          </ul>
        </div>
        {/* Role Selection Modal */}
        {showRoleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl">
              <h3 className="text-xl font-semibold text-slate-900">Selecciona tu rol profesional</h3>
              <p className="mt-2 text-sm text-slate-600">
                Antes de enviar, necesitamos conocer tu perfil profesional
              </p>

              <div className="mt-6 space-y-2">
                {PARTICIPANT_ROLES.map((role) => (
                  <label
                    key={role}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition ${
                      selectedRole === role
                        ? "border-blue-600 bg-blue-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role}
                      checked={selectedRole === role}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="font-medium text-slate-900">{PARTICIPANT_ROLE_LABELS[role]}</span>
                  </label>
                ))}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="flex-1 rounded-full border border-slate-200 px-6 py-3 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRoleSelected}
                  disabled={!selectedRole}
                  className="flex-1 rounded-full bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continuar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl">
              <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 text-center">¿Confirmar envío?</h3>
              <p className="mt-3 text-sm text-slate-600 text-center">
                ¿Estás seguro/a de enviar tu encuesta? Una vez enviada <strong>no podrás modificarla</strong>.
              </p>
              <p className="mt-2 text-sm text-blue-600 text-center">
                Rol seleccionado: <strong>{selectedRole ? PARTICIPANT_ROLE_LABELS[selectedRole as keyof typeof PARTICIPANT_ROLE_LABELS] : ""}</strong>
              </p>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setShowRoleModal(true);
                  }}
                  disabled={submitting}
                  className="flex-1 rounded-full border border-slate-200 px-6 py-3 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Volver
                </button>
                <button
                  onClick={confirmSubmit}
                  disabled={submitting}
                  className="flex-1 rounded-full bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
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

