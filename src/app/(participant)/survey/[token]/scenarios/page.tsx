"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ProgressBar } from "@/components/common/ProgressBar";
import { apiRoutes } from "@/lib/api/routes";

interface ScenarioStatus {
  id: string;
  title: string;
  description: string;
  order: number;
  completed: boolean;
  indicatorCount: number;
}

export default function ScenarioOverviewPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [scenarios, setScenarios] = useState<ScenarioStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    async function loadProgress() {
      try {
        // Get session
        const sessionResponse = await fetch(apiRoutes.sessionGet(token));
        if (!sessionResponse.ok) {
          throw new Error("Failed to load session");
        }
        const session = await sessionResponse.json();
        setSessionId(session.id);

        // Get session summary with scenarios
        const summaryResponse = await fetch(apiRoutes.sessionSummary(session.id));
        if (!summaryResponse.ok) {
          throw new Error("Failed to load summary");
        }
        const summary = await summaryResponse.json();

        // Map scenarios with their status
        const scenariosWithStatus = summary.scenarios.map((scenario: any) => {
          const weights = scenario.weights || {};
          const hasWeights = Object.keys(weights).length > 0;
          const totalWeight = Object.values(weights).reduce((sum: number, w) => sum + (w as number), 0);
          const completed = hasWeights && Math.abs(totalWeight - 100) < 0.1;

          return {
            id: scenario.id,
            title: scenario.title,
            description: scenario.description || "",
            order: scenario.order,
            completed,
            indicatorCount: scenario.indicatorCount || 0,
          };
        });

        setScenarios(scenariosWithStatus);

        // Calculate global progress
        const completedCount = scenariosWithStatus.filter((s: ScenarioStatus) => s.completed).length;
        setProgress(completedCount / scenariosWithStatus.length);
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
        <div className="text-slate-600">Cargando escenarios...</div>
      </div>
    );
  }

  const completedCount = scenarios.filter((s) => s.completed).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-slate-50 px-6 py-12">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <header className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Escenarios epidemiológicos</h1>
              <p className="mt-2 text-slate-600">
                Revisa y completa cada escenario. Tu progreso se guarda automáticamente.
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                {completedCount}/{scenarios.length}
              </div>
              <div className="text-sm text-slate-600">completados</div>
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
          {completedCount === scenarios.length && (
            <Link
              href={`/survey/${token}/submit`}
              className="rounded-full bg-green-600 px-6 py-2.5 font-semibold text-white transition hover:bg-green-700"
            >
              Enviar encuesta final
            </Link>
          )}
        </div>

        {/* Scenarios Grid */}
        <section className="grid gap-4">
          {scenarios.map((scenario) => (
            <Link
              key={scenario.id}
              href={`/survey/${token}/scenarios/${scenario.id}`}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                      {scenario.order}
                    </span>
                    <h2 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600">
                      {scenario.title}
                    </h2>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{scenario.description}</p>
                  <div className="mt-3 flex gap-2 text-xs text-slate-500">
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                      {scenario.indicatorCount} indicadores disponibles
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
                      scenario.completed
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {scenario.completed ? "Completado" : "Pendiente"}
                  </span>
                  <span className="text-xs text-blue-600 group-hover:underline">
                    {scenario.completed ? "Revisar →" : "Completar →"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </section>

        {/* Help Card */}
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6">
          <h3 className="font-semibold text-slate-900">Consejos</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>• Puedes completar los escenarios en cualquier orden</li>
            <li>• Los cambios se guardan automáticamente cada pocos segundos</li>
            <li>• Asegúrate que los pesos sumen exactamente 100% antes de avanzar</li>
            <li>• Usa "Copiar del anterior" para agilizar escenarios similares</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
