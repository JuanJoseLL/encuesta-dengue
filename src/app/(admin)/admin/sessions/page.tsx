"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProgressBar } from "@/components/common/ProgressBar";

interface Session {
  id: string;
  respondentName: string;
  respondentRole: string;
  progress: number;
  progressScenarios: number;
  totalScenarios: number;
  status: string;
  lastActivity: string;
}

const SURVEY_ID = "survey-dengue-2025";

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSessions() {
      try {
        const response = await fetch(`/api/admin/sessions?surveyId=${SURVEY_ID}`);

        if (!response.ok) {
          throw new Error("Failed to load sessions");
        }

        const data = await response.json();
        setSessions(data.sessions);
      } catch (err) {
        console.error("Error loading sessions:", err);
        setError("Error al cargar las sesiones");
      } finally {
        setLoading(false);
      }
    }

    loadSessions();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-slate-600">Cargando sesiones...</div>
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 px-6 py-12">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <header>
          <Link href="/admin/dashboard" className="text-sm text-blue-600 hover:underline">
            ← Volver al dashboard
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-slate-900">Sesiones Activas</h1>
          <p className="mt-2 text-slate-600">
            Supervisión de avance en tiempo real, con logs de autosave y estado de sesiones
          </p>
        </header>

        {/* Sessions Table */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {sessions.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              No hay sesiones aún. Los participantes comenzarán a aparecer aquí cuando accedan con
              sus tokens.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-100 text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.2em] text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">Sesión</th>
                  <th className="px-4 py-3 text-left">Participante</th>
                  <th className="px-4 py-3 text-left">Rol</th>
                  <th className="px-4 py-3 text-left">Progreso</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                  <th className="px-4 py-3 text-left">Última actividad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {sessions.map((session) => (
                  <tr key={session.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs">{session.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{session.respondentName}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs">
                        {session.respondentRole}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <ProgressBar
                          value={session.progressScenarios / session.totalScenarios}
                          size="sm"
                        />
                        <span className="text-xs text-slate-600">
                          {session.progressScenarios}/{session.totalScenarios}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
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
                    <td className="px-4 py-3 text-xs text-slate-400">
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
          )}
        </section>
      </div>
    </div>
  );
}
