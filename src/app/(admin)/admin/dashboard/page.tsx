"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Session {
  id: string;
  respondentName: string;
  respondentRole: string;
  progress: number;
  progressStrategies: number;
  totalStrategies: number;
  status: string;
  lastActivity: string;
}

interface Stats {
  totalSessions: number;
  completedSessions: number;
  inProgressSessions: number;
  completionRate: number;
  averageCompletedStrategies: number;
  totalStrategies: number;
}

const SURVEY_ID = "survey-dengue-2025";

export default function AdminDashboardPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        // Load sessions and stats in parallel
        const [sessionsRes, statsRes] = await Promise.all([
          fetch(`/api/admin/sessions?surveyId=${SURVEY_ID}`),
          fetch(`/api/admin/stats?surveyId=${SURVEY_ID}`),
        ]);

        if (!sessionsRes.ok || !statsRes.ok) {
          throw new Error("Failed to load data");
        }

        const sessionsData = await sessionsRes.json();
        const statsData = await statsRes.json();

        setSessions(sessionsData.sessions.slice(0, 5)); // Show only 5 recent
        setStats(statsData);
      } catch (err) {
        console.error("Error loading dashboard:", err);
        setError("Error al cargar el dashboard");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-slate-600">Cargando dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!stats) {
    return null;
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
            <p className="mt-2 text-3xl font-bold text-slate-900">{stats.totalSessions}</p>
            <p className="mt-1 text-xs text-slate-600">
              {stats.completedSessions} completadas
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              En Progreso
            </p>
            <p className="mt-2 text-3xl font-bold text-blue-600">{stats.inProgressSessions}</p>
            <p className="mt-1 text-xs text-slate-600">Activas ahora</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Tasa de Completitud
            </p>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {stats.completionRate.toFixed(0)}%
            </p>
            <p className="mt-1 text-xs text-slate-600">Objetivo: ≥85%</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Progreso Promedio
            </p>
            <p className="mt-2 text-3xl font-bold text-amber-600">
              {stats.averageCompletedStrategies.toFixed(1)}
            </p>
            <p className="mt-1 text-xs text-slate-600">de {stats.totalStrategies} estrategias</p>
          </div>
        </section>

        {/* Survey Info */}
        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Encuesta de Validación de Indicadores Epidemiológicos - Dengue 2025
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Recolección de ponderaciones de indicadores para estrategias de mitigación del dengue
              </p>
              <div className="mt-4 flex gap-3 text-xs text-slate-500">
                <span className="rounded-full bg-green-100 px-3 py-1 font-medium text-green-700">
                  Activa
                </span>
                <span>Versión 1.0</span>
                <span>•</span>
                <span>{stats.totalStrategies} estrategias</span>
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

          {sessions.length === 0 ? (
            <div className="mt-6 text-center text-sm text-slate-500">
              No hay sesiones aún. Los participantes comenzarán a aparecer aquí cuando accedan con
              sus tokens.
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    <th className="pb-3">Participante</th>
                    <th className="pb-3">Rol</th>
                    <th className="pb-3">Progreso</th>
                    <th className="pb-3">Estado</th>
                    <th className="pb-3">Última actividad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sessions.map((session) => (
                    <tr key={session.id} className="hover:bg-slate-50">
                      <td className="py-4 font-medium text-slate-900">{session.respondentName}</td>
                      <td className="py-4 text-slate-600">
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs">
                          {session.respondentRole}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-full bg-blue-600"
                              style={{
                                width: `${(session.progressStrategies / session.totalStrategies) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-slate-600">
                            {session.progressStrategies}/{session.totalStrategies}
                          </span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            session.status === "submitted"
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {session.status === "submitted" ? "Completada" : "En progreso"}
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6">
            <h3 className="font-semibold text-slate-900">Analizar Resultados</h3>
            <p className="mt-2 text-sm text-slate-600">
              Exporta datos consolidados en formato CSV o Excel
            </p>
            <Link
              href="/admin/exports"
              className="mt-4 inline-block rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Ir a exportaciones
            </Link>
          </div>

          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6">
            <h3 className="font-semibold text-slate-900">Ver Sesiones</h3>
            <p className="mt-2 text-sm text-slate-600">
              Revisa el estado de todas las sesiones y supervisa el progreso
            </p>
            <Link
              href="/admin/sessions"
              className="mt-4 inline-block rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Ver sesiones
            </Link>
          </div>

          <div className="rounded-2xl border border-dashed border-blue-300 bg-blue-50 p-6">
            <h3 className="font-semibold text-slate-900">Agregar Participantes</h3>
            <p className="mt-2 text-sm text-slate-600">
              Crea nuevos participantes y genera tokens de acceso
            </p>
            <Link
              href="/admin/respondents"
              className="mt-4 inline-block rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
            >
              Gestionar participantes
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
