"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProgressBar } from "@/components/common/ProgressBar";
import { apiRoutes } from "@/lib/api/routes";

interface StrategyStatus {
  id: string;
  metodo: string;
  description?: string;
  objetivo?: string;
  codigo?: string;
  order: number;
  completed: boolean;
  status: "reviewed" | "modified" | "incomplete" | "not-started";
  indicatorCount: number;
  hasModifications?: boolean;
  hasThresholdModifications?: boolean;
}

export default function SecondIterationStrategiesPage({
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
  const [respondentEmail, setRespondentEmail] = useState<string>("");

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
        setRespondentEmail(session.respondent?.email || "");

        // Get second iteration progress
        const progressResponse = await fetch(
          `/api/second-iteration/progress?sessionId=${session.id}`
        );
        if (!progressResponse.ok) {
          throw new Error("Failed to load second iteration progress");
        }
        const progressData = await progressResponse.json();

        // Map strategies with their status
        const strategiesWithStatus = progressData.strategies.map((item: any) => {
          const completed = item.status === "reviewed";
          const status: "reviewed" | "modified" | "incomplete" | "not-started" = item.status;

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
            hasModifications: item.hasModifications,
            hasThresholdModifications: item.hasThresholdModifications,
          };
        });

        setStrategies(strategiesWithStatus);
        setProgress(progressData.progress);
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
              <h1 className="text-3xl font-bold text-slate-900">
                Segunda Iteración - Revisión Colaborativa
              </h1>
              <p className="mt-2 text-slate-600">
                Revise las respuestas consolidadas de todos los expertos y
                ajuste sus ponderaciones si lo considera necesario. Puede
                mantener su postura original o modificarla basándose en el
                consenso del grupo.
              </p>
              <p className="mt-1 text-sm italic text-slate-500">
                Usuario: <strong>{respondentEmail}</strong>
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                {completedCount}/{strategies.length}
              </div>
              <div className="text-sm text-slate-600">revisadas</div>
            </div>
          </div>
          <ProgressBar
            value={progress}
            label={`Progreso: ${Math.round(progress * 100)}%`}
          />
        </header>

        {/* Info Card */}
        <div className="rounded-2xl border-2 border-indigo-700 bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg
                className="h-8 w-8 text-indigo-100"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-3">
                ¿Cómo funciona esta iteración?
              </h3>
              <p className="text-base leading-relaxed text-indigo-50">
                En esta segunda iteración, podrá <strong className="font-bold text-white">ver todos los indicadores</strong> que
                fueron seleccionados por al menos un experto para cada
                estrategia, en la iteración anterior. Además, podrá <strong className="font-bold text-white">ver y modificar el peso</strong> que usted asignó, así como el
                promedio del grupo. Es decir, la idea es <strong className="font-bold text-white">avanzar hacia un consenso final</strong>. Los cambios se guardan automáticamente en una copia
                separada de sus respuestas iniciales, por trazabilidad.
              </p>
            </div>
          </div>
        </div>

        {/* Strategies Grid */}
        <section className="grid gap-4">
          {strategies.map((strategy) => (
            <Link
              key={strategy.id}
              href={`/2ndIteration/${token}/strategies/${strategy.id}`}
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
                  {strategy.status === "reviewed" ? (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Revisada
                      </div>
                      {(strategy.hasModifications || strategy.hasThresholdModifications) && (
                        <div className="text-xs text-amber-600">
                          Modificada
                        </div>
                      )}
                    </div>
                  ) : strategy.status === "modified" ? (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs text-amber-600">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Modificada
                      </div>
                      <span className="text-xs text-blue-600 group-hover:underline">
                        Revisar →
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-blue-600 group-hover:underline">
                      Revisar →
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}
