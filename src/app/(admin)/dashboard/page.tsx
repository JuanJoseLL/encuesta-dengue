"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { mockApi } from "@/lib/mock/api";
import { MOCK_SURVEY, MOCK_SESSIONS } from "@/lib/mock/data";

export default function AdminDashboardPage() {
  const [sessions, setSessions] = useState(MOCK_SESSIONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSessions() {
      try {
        const data = await mockApi.getAllSessions();
        setSessions(data);
      } catch (error) {
        console.error("Error loading sessions:", error);
      } finally {
        setLoading(false);
      }
    }

    loadSessions();
  }, []);

  const completedCount = sessions.filter((s) => s.status === "completed").length;
  const inProgressCount = sessions.filter((s) => s.status === "in-progress").length;
  const avgProgress = sessions.reduce((sum, s) => sum + s.progress, 0) / sessions.length;
  const completionRate = (completedCount / sessions.length) * 100;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-slate-600">Cargando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 px-6 py-12">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <header>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard Administrativo</h1>
          <p className="mt-2 text-slate-600">
            Gestiona encuestas, supervisa sesiones activas y exporta resultados consolidados
          </p>
        </header>

        {/* Stats Grid */}
        <section className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Sesiones
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{sessions.length}</p>
            <p className="mt-1 text-xs text-slate-600">
              {completedCount} completadas
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              En Progreso
            </p>
            <p className="mt-2 text-3xl font-bold text-blue-600">{inProgressCount}</p>
            <p className="mt-1 text-xs text-slate-600">
              Activas ahora
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Tasa de Completitud
            </p>
            <p className="mt-2 text-3xl font-bold text-green-600">{completionRate.toFixed(0)}%</p>
            <p className="mt-1 text-xs text-slate-600">
              Objetivo: ≥85%
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Progreso Promedio
            </p>
            <p className="mt-2 text-3xl font-bold text-amber-600">{avgProgress.toFixed(1)}</p>
            <p className="mt-1 text-xs text-slate-600">
              de {MOCK_SURVEY.totalScenarios} escenarios
            </p>
          </div>
        </section>

        {/* Survey Info */}
        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{MOCK_SURVEY.title}</h2>
              <p className="mt-1 text-sm text-slate-600">{MOCK_SURVEY.description}</p>
              <div className="mt-4 flex gap-3 text-xs text-slate-500">
                <span className="rounded-full bg-green-100 px-3 py-1 font-medium text-green-700">
                  {MOCK_SURVEY.active ? "Activa" : "Inactiva"}
                </span>
                <span>Versión {MOCK_SURVEY.version}</span>
                <span>•</span>
                <span>{MOCK_SURVEY.totalScenarios} escenarios</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href="/admin/sessions"
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Ver todas las sesiones
              </Link>
              <Link
                href="/admin/exports"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Exportar resultados
              </Link>
            </div>
          </div>
        </section>

        {/* Recent Sessions */}
        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Sesiones Recientes</h2>
              <p className="mt-1 text-sm text-slate-600">Últimas actividades de participantes</p>
            </div>
            <Link
              href="/admin/sessions"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Ver todas →
            </Link>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  <th className="pb-3">Participante</th>
                  <th className="pb-3">Rol</th>
                  <th className="pb-3">Progreso</th>
                  <th className="pb-3">Estado</th>
                  <th className="pb-3">Última actividad</th>
                  <th className="pb-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sessions.map((session) => (
                  <tr key={session.id} className="hover:bg-slate-50">
                    <td className="py-4 font-medium text-slate-900">{session.respondentName}</td>
                    <td className="py-4 text-slate-600">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs">
                        {session.role}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full bg-blue-600"
                            style={{ width: `${(session.progress / session.totalScenarios) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-600">
                          {session.progress}/{session.totalScenarios}
                        </span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          session.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {session.status === "completed" ? "Completada" : "En progreso"}
                      </span>
                    </td>
                    <td className="py-4 text-slate-600">
                      {new Date(session.lastActivity).toLocaleString("es-ES", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-4">
                      <button className="text-sm text-blue-600 hover:underline">
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6">
            <h3 className="font-semibold text-slate-900">Analizar Resultados</h3>
            <p className="mt-2 text-sm text-slate-600">
              Exporta datos consolidados en formato CSV para análisis estadístico
            </p>
            <Link
              href="/admin/exports"
              className="mt-4 inline-block rounded-lg bg-white border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Ir a exportaciones
            </Link>
          </div>

          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6">
            <h3 className="font-semibold text-slate-900">Gestionar Participantes</h3>
            <p className="mt-2 text-sm text-slate-600">
              Revisa el estado de todas las sesiones y envía recordatorios
            </p>
            <Link
              href="/admin/sessions"
              className="mt-4 inline-block rounded-lg bg-white border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Ver sesiones
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
