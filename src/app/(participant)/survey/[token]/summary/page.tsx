"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProgressBar } from "@/components/common/ProgressBar";
import { mockApi } from "@/lib/mock/api";
import { MOCK_SCENARIOS, MOCK_INDICATORS } from "@/lib/mock/data";

interface ScenarioSummary {
  scenarioId: string;
  scenarioTitle: string;
  order: number;
  status: "complete" | "incomplete" | "empty";
  totalWeight: number;
  indicators: Array<{ id: string; name: string; weight: number }>;
}

export default function SurveySummaryPage({ params }: { params: Promise<{ token: string }> }) {
  const router = useRouter();
  const { token } = use(params);

  const [summaries, setSummaries] = useState<ScenarioSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);

  useEffect(() => {
    async function loadSummary() {
      try {
        const session = await mockApi.getSessionSummary(`session-${token}`);

        const scenarioSummaries = MOCK_SCENARIOS.map((scenario) => {
          const progress = session.scenarioProgress[scenario.id];
          const weights = progress?.weights || {};
          const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
          const isComplete = Object.keys(weights).length > 0 && Math.abs(totalWeight - 100) < 0.1;

          const indicators = Object.entries(weights).map(([indicatorId, weight]) => {
            const indicator = MOCK_INDICATORS.find((ind) => ind.id === indicatorId);
            return {
              id: indicatorId,
              name: indicator?.name || indicatorId,
              weight,
            };
          });

          const status: "complete" | "incomplete" | "empty" =
            Object.keys(weights).length === 0 ? "empty" : isComplete ? "complete" : "incomplete";

          return {
            scenarioId: scenario.id,
            scenarioTitle: scenario.title,
            order: scenario.order,
            status,
            totalWeight,
            indicators,
          };
        });

        setSummaries(scenarioSummaries);

        // Verificar si todos los escenarios están completos
        const allComplete = scenarioSummaries.every((s) => s.status === "complete");
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
    if (!canSubmit) return;

    if (!confirm("¿Estás seguro/a de enviar tu encuesta? Una vez enviada no podrás modificarla.")) {
      return;
    }

    setSubmitting(true);
    try {
      await mockApi.submitSession(`session-${token}`);
      router.push(`/survey/${token}/success`);
    } catch (error) {
      alert("Error al enviar la encuesta. Por favor intenta nuevamente.");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-slate-600">Cargando resumen...</div>
      </div>
    );
  }

  const completedCount = summaries.filter((s) => s.status === "complete").length;
  const incompleteCount = summaries.filter((s) => s.status === "incomplete").length;
  const emptyCount = summaries.filter((s) => s.status === "empty").length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-slate-50 px-6 py-12">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <header className="space-y-4">
          <Link href={`/survey/${token}/scenarios`} className="text-sm text-blue-600 hover:underline">
            ← Volver a escenarios
          </Link>

          <div>
            <h1 className="text-3xl font-bold text-slate-900">Resumen de tu ponderación</h1>
            <p className="mt-2 text-slate-600">
              Revisa tus respuestas antes de enviar. Puedes editar cualquier escenario haciendo clic en "Editar".
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-2xl font-bold text-green-600">{completedCount}</div>
              <div className="text-sm text-slate-600">Completos</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-2xl font-bold text-amber-600">{incompleteCount}</div>
              <div className="text-sm text-slate-600">Incompletos</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-2xl font-bold text-slate-400">{emptyCount}</div>
              <div className="text-sm text-slate-600">Sin responder</div>
            </div>
          </div>

          <ProgressBar
            value={completedCount / summaries.length}
            label={`Progreso: ${completedCount}/${summaries.length} completos`}
          />

          {!canSubmit && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
              <strong>Atención:</strong> Debes completar todos los escenarios (pesos sumando 100%) antes de
              enviar la encuesta.
            </div>
          )}

          {canSubmit && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-800">
              <strong>Listo para enviar:</strong> Todos los escenarios están completos. Puedes revisar y enviar
              tu encuesta.
            </div>
          )}
        </header>

        {/* Scenarios Summary */}
        <section className="space-y-4">
          {summaries.map((summary) => (
            <article
              key={summary.scenarioId}
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
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                      {summary.order}
                    </span>
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">{summary.scenarioTitle}</h2>
                      <p className="text-xs text-slate-500">{summary.scenarioId}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
                      summary.status === "complete"
                        ? "bg-green-100 text-green-700"
                        : summary.status === "incomplete"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {summary.status === "complete"
                      ? "Completo"
                      : summary.status === "incomplete"
                        ? "Incompleto"
                        : "Sin responder"}
                  </span>
                  <Link
                    href={`/survey/${token}/scenarios/${summary.scenarioId}`}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Editar
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
                      {summary.indicators.map((indicator) => (
                        <tr key={indicator.id} className="border-b border-slate-100">
                          <td className="py-2 text-slate-700">{indicator.name}</td>
                          <td className="py-2 text-right font-mono text-slate-900">
                            {indicator.weight.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-300">
                        <td className="py-2 font-semibold text-slate-900">TOTAL</td>
                        <td
                          className={`py-2 text-right font-mono text-lg font-bold ${
                            summary.status === "complete" ? "text-green-600" : "text-amber-600"
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
                  No has seleccionado indicadores para este escenario
                </div>
              )}
            </article>
          ))}
        </section>

        {/* Footer Actions */}
        <footer className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <Link
            href={`/survey/${token}/scenarios`}
            className="rounded-full border border-slate-200 px-6 py-3 font-medium text-slate-700 hover:bg-slate-50"
          >
            ← Continuar editando
          </Link>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="rounded-full bg-green-600 px-8 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Enviando..." : "Enviar encuesta final"}
          </button>
        </footer>
      </div>
    </div>
  );
}
