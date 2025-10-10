import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950/5">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pb-24 pt-12 sm:px-8">
        <header className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-[0.28em] text-slate-400">Panel administrativo</span>
          <h1 className="text-2xl font-semibold text-slate-900">Encuesta de indicadores de dengue</h1>
          <p className="text-sm text-slate-500">Gestiona estrategias, sesiones activas y exportaciones.</p>
        </header>
        {children}
      </div>
    </div>
  );
}
