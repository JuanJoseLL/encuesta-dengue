"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ProgressBar } from "@/components/common/ProgressBar";
import { apiRoutes } from "@/lib/api/routes";

interface StrategyStatus {
  id: string;
  title: string;
  description: string;
  order: number;
  completed: boolean;
  indicatorCount: number;
}

export default function StrategyOverviewPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [strategies, setStrategies] = useState<StrategyStatus[]>([]);
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
        const sessionData = await sessionResponse.json();
        const session = sessionData.session;
        setSessionId(session.id);

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
          {completedCount === strategies.length && (
            <Link
              href={`/survey/${token}/submit`}
              className="rounded-full bg-green-600 px-6 py-2.5 font-semibold text-white transition hover:bg-green-700"
            >
              Enviar encuesta final
            </Link>
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
      </div>
    </div>
  );
}

