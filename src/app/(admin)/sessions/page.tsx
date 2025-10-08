import { ProgressBar } from "@/components/common/ProgressBar";

const mockSessions = [
  {
    id: "session-1",
    respondentRole: "Epidemiólogo/a",
    progress: 0.7,
    status: "En progreso",
    lastUpdate: "2024-06-02 14:20",
  },
  {
    id: "session-2",
    respondentRole: "Entomólogo/a",
    progress: 1,
    status: "Enviado",
    lastUpdate: "2024-06-01 17:05",
  },
];

export default function AdminSessionsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-900">Sesiones activas</h2>
        <p className="text-sm text-slate-500">
          Supervisión de avance en tiempo real, con logs de autosave y estado de token.
        </p>
      </header>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-100 text-sm text-slate-700">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.2em] text-slate-500">
            <tr>
              <th className="px-4 py-3 text-left">Sesión</th>
              <th className="px-4 py-3 text-left">Rol</th>
              <th className="px-4 py-3 text-left">Progreso</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-left">Última actualización</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {mockSessions.map((session) => (
              <tr key={session.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-xs">{session.id}</td>
                <td className="px-4 py-3">{session.respondentRole}</td>
                <td className="px-4 py-3">
                  <ProgressBar value={session.progress} size="sm" />
                </td>
                <td className="px-4 py-3 text-xs font-medium text-slate-500">{session.status}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{session.lastUpdate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
