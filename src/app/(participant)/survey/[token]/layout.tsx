"use client";

import { use, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTokenValidation } from "@/hooks";

export default function SurveyTokenLayout({
  params,
  children,
}: {
  params: Promise<{ token: string }>;
  children: ReactNode;
}) {
  const { token } = use(params);
  const pathname = usePathname();
  const { isValidating, isValid, error, respondentName } = useTokenValidation(token);

  // Mostrar loading mientras valida
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 via-white to-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Validando acceso...</p>
        </div>
      </div>
    );
  }

  // Mostrar error si el token no es válido
  if (!isValid || error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 via-white to-slate-50 px-6">
        <div className="max-w-md w-full">
          <div className="rounded-2xl border-2 border-red-200 bg-white p-8 text-center shadow-lg">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Token no válido</h1>
            <p className="mt-3 text-slate-600">
              El token de acceso no es válido o la sesión no existe. Serás redirigido automáticamente.
            </p>
            <div className="mt-6">
              <Link
                href="/survey"
                className="inline-block rounded-full bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Ir a la página de acceso
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si el token es válido, mostrar el contenido normal
  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap items-center justify-between gap-3 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-900">Encuesta Dengue · Sesión</span>
          {respondentName && (
            <span className="rounded-full bg-slate-900/90 px-3 py-1 text-xs font-semibold text-white">
              {respondentName}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/survey/${token}/strategies`}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
              pathname.includes('/strategies')
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            Estrategias
          </Link>
          <Link
            href={`/survey/${token}/summary`}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
              pathname.includes('/summary')
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            Resumen global
          </Link>
          <Link
            href="/"
            className="rounded-full px-3 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 border border-slate-200"
          >
            Volver al inicio
          </Link>
        </div>
      </nav>
      {children}
    </div>
  );
}
