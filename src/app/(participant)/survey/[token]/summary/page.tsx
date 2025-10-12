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

interface StrategySummary {
  strategyId: string;
  strategyMetodo: string;
  strategyDescription?: string;
  strategyObjetivo?: string;
  strategyCodigo?: string;
  order: number;
  status: "complete" | "incomplete" | "empty";
  totalWeight: number;
  indicators: Array<{ id: string; name: string; weight: number }>;
}

export default function SurveySummaryPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const router = useRouter();
  const { token } = use(params);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<StrategySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);
  const [respondentRole, setRespondentRole] = useState<string | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [sessionStatus, setSessionStatus] = useState<string>("draft");

  useEffect(() => {
    async function loadSummary() {
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

        // Map items to strategy summaries
        const strategySummaries = (summary.items || []).map((item: any) => {
          const status: "complete" | "incomplete" | "empty" =
            item.status === "complete"
              ? "complete"
              : item.status === "not-applicable"
              ? "empty"
              : "incomplete";

          return {
            strategyId: item.strategyId,
            strategyMetodo: item.strategyMetodo,
            strategyDescription: item.strategyDescription,
            strategyObjetivo: item.strategyObjetivo,
            strategyCodigo: item.strategyCodigo,
            order: item.strategyOrder,
            status,
            totalWeight: item.totalWeight,
            indicators: item.indicators || [],
          };
        });

        setSummaries(strategySummaries);

        // Verificar si todas las estrategias están completas
        const allComplete = strategySummaries.every(
          (s: StrategySummary) => s.status === "complete"
        );
        setCanSubmit(allComplete);
      } catch (error) {
        console.error("Error loading summary:", error);
      } finally {
        setLoading(false);
      }
    }

    loadSummary();
  }, [token]);

  const handleSubmit = async () => {
    if (!canSubmit || !sessionId) return;

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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-slate-600">Cargando resumen...</div>
      </div>
    );
  }

  const completedCount = summaries.filter(
    (s) => s.status === "complete"
  ).length;
  const incompleteCount = summaries.filter(
    (s) => s.status === "incomplete"
  ).length;
  const emptyCount = summaries.filter((s) => s.status === "empty").length;

  // Si la sesión ya fue enviada, mostrar mensaje
  if (sessionStatus === "submitted") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-slate-50 px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border-2 border-green-200 bg-white p-8 shadow-lg">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-slate-900">
                Encuesta Enviada
              </h1>
              <p className="mt-3 text-slate-700">
                Ha completado y enviado satisfactoriamente la encuesta.
              </p>
              <p className="mt-2 text-slate-700">
                Agradecemos su participación y el tiempo dedicado a este
                ejercicio.
              </p>
            </div>

            <div className="text-left space-y-4 mb-6">
              <p className="text-sm text-slate-600 leading-relaxed">
                Su contribución es fundamental para fortalecer el proceso de
                análisis y priorización de estrategias de mitigación del Dengue,
                y para el desarrollo de un modelo de inteligencia artificial
                basado en conocimiento experto.
              </p>

              <div className="border-t border-slate-200 pt-4">
                <h2 className="text-base font-semibold text-slate-900 mb-2">
                  Resultados y Análisis de la Encuesta
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Los resultados y análisis de la Encuesta de Ponderación de
                  Indicadores por Expertos serán socializados próximamente. Le
                  estaremos enviando una invitación formal para participar en la
                  presentación de resultados y en el espacio de construcción de
                  consensos entre los diferentes grupos de expertos.
                </p>
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/"
                className="inline-block rounded-full bg-blue-600 px-8 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderSummaryActions = () => (
    <footer className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <Link
        href={`/survey/${token}/strategies`}
        className="rounded-full border border-slate-200 px-6 py-3 font-medium text-slate-700 hover:bg-slate-50"
      >
        ← Continuar editando
      </Link>

      {sessionStatus !== "submitted" && (
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          className="rounded-full bg-green-600 px-8 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Enviando..." : "Enviar encuesta final"}
        </button>
      )}
    </footer>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-slate-50 px-6 py-12">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <header className="space-y-4">
          {renderSummaryActions()}

          <Link
            href={`/survey/${token}/strategies`}
            className="text-sm text-blue-600 hover:underline"
          >
            ← Volver a estrategias
          </Link>

          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Resumen de Ponderación
            </h1>
            <p className="mt-2 text-slate-600">
              Revise cuidadosamente sus respuestas antes de enviar la encuesta.
              Puede editar cualquier estrategia seleccionando la opción{" "}
              <b>Editar ponderación</b>
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-2xl font-bold text-green-600">
                {completedCount}
              </div>
              <div className="text-sm text-slate-600">Completos</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-2xl font-bold text-amber-600">
                {incompleteCount}
              </div>
              <div className="text-sm text-slate-600">Incompletos</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-2xl font-bold text-slate-400">
                {emptyCount}
              </div>
              <div className="text-sm text-slate-600">Sin responder</div>
            </div>
          </div>

          <ProgressBar
            value={completedCount / summaries.length}
            label={`Progreso: ${completedCount}/${summaries.length} completos`}
          />

          {!canSubmit && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
              <strong>Atención:</strong> Antes de enviar, asegúrese de que todas
              las estrategias estén diligenciadas y que los pesos asignados
              sumen exactamente el 100% en cada una.
            </div>
          )}

          {canSubmit && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-800">
              <strong>Listo para enviar:</strong> Todas las estrategias están
              completas. Puedes revisar y enviar tu encuesta.
            </div>
          )}
        </header>

        {/* Strategies Summary */}
        <section className="space-y-4">
          {summaries.map((summary) => (
            <article
              key={summary.strategyId}
              className={`rounded-2xl border-2 bg-white p-6 shadow-sm ${
                summary.status === "complete"
                  ? "border-green-200"
                  : summary.status === "incomplete"
                  ? "border-amber-200"
                  : "border-slate-200"
              }`}
            >
              <header className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                      {summary.order}
                    </span>
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold text-slate-900">
                        {summary.strategyMetodo}
                      </h2>
                      {summary.strategyCodigo && (
                        <span className="inline-block mt-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          {summary.strategyCodigo}
                        </span>
                      )}
                    </div>
                  </div>

                  {summary.strategyObjetivo && (
                    <div className="ml-11">
                      <span className="text-xs font-semibold text-slate-700">
                        Objetivo:{" "}
                      </span>
                      <span className="text-xs text-slate-600">
                        {summary.strategyObjetivo}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
                      summary.status === "complete"
                        ? "bg-green-100 text-green-700"
                        : summary.status === "incomplete"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {summary.status === "complete"
                      ? "Ponderación completa"
                      : summary.status === "incomplete"
                      ? "Pendiente incompleta"
                      : "Pendiente de ponderación"}
                  </span>
                  <Link
                    href={`/survey/${token}/strategies/${summary.strategyId}`}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Editar ponderación
                  </Link>
                </div>
              </header>

              {summary.indicators.length > 0 ? (
                <div className="mt-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                        <th className="pb-2">Indicador</th>
                        <th className="pb-2 text-right">Peso</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.indicators.map((indicator: any) => (
                        <tr
                          key={indicator.indicatorId || indicator.id}
                          className="border-b border-slate-100"
                        >
                          <td className="py-2 text-slate-700">
                            {indicator.indicatorName || indicator.name}
                          </td>
                          <td className="py-2 text-right font-mono text-slate-900">
                            {indicator.weight.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-300">
                        <td className="py-2 font-semibold text-slate-900">
                          TOTAL
                        </td>
                        <td
                          className={`py-2 text-right font-mono text-lg font-bold ${
                            summary.status === "complete"
                              ? "text-green-600"
                              : "text-amber-600"
                          }`}
                        >
                          {summary.totalWeight.toFixed(1)}%
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="mt-4 text-center text-sm text-slate-500">
                  No ha seleccionado indicadores para esta estrategia
                </div>
              )}
            </article>
          ))}
        </section>

        {/* Footer Actions */}
        {renderSummaryActions()}

        {/* Role Selection Modal */}
        {showRoleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl">
              <h3 className="text-xl font-semibold text-slate-900">
                Selecciona tu rol profesional
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Esta información nos ayuda a analizar las respuestas según
                perfiles de especialización
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
                    <span className="font-medium text-slate-900">
                      {PARTICIPANT_ROLE_LABELS[role]}
                    </span>
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
        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl">
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
              <h3 className="text-xl font-semibold text-slate-900 text-center">
                ¿Confirmar envío?
              </h3>
              <p className="mt-3 text-sm text-slate-600 text-center">
                ¿Estás seguro/a de enviar tu encuesta? Una vez enviada{" "}
                <strong>no podrás modificarla</strong>.
              </p>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={submitting}
                  className="flex-1 rounded-full border border-slate-200 px-6 py-3 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancelar
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
