import type { ReactNode } from "react";
import Link from "next/link";

export default function SurveyTokenLayout({
  params,
  children,
}: {
  params: { token: string };
  children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap items-center justify-between gap-3 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-900">Encuesta Dengue · Sesión</span>
          <span className="rounded-full bg-slate-900/90 px-3 py-1 text-xs font-semibold text-white">
            {params.token}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/survey/${params.token}`}
            className="rounded-full px-3 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100"
          >
            Resumen del token
          </Link>
          <Link
            href={`/survey/${params.token}/summary`}
            className="rounded-full px-3 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100"
          >
            Resumen global
          </Link>
        </div>
      </nav>
      {children}
    </div>
  );
}
