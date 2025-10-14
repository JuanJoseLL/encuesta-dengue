"use client";

import { use } from "react";
import Link from "next/link";

export default function SuccessPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-green-50 via-white to-slate-50 px-6">
      <div className="mx-auto max-w-2xl space-y-8 text-center">
        <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
          <svg className="h-16 w-16 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-slate-900">¡Encuesta enviada con éxito!</h1>
          <p className="text-lg text-slate-600">
            Muchas gracias por tu participación. Tus respuestas son fundamentales para esta investigación.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">¿Qué sigue?</h2>
          <ul className="mt-4 space-y-3 text-left text-sm text-slate-600">
            <li className="flex gap-3">
              <span className="text-green-600">•</span>
              <span>
                Tus respuestas han sido registradas de forma segura y anónima
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-600">•</span>
              <span>
                El equipo de investigación analizará los datos consolidados de todos los participantes
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-600">•</span>
              <span>
                Los resultados contribuirán a mejorar los sistemas de vigilancia epidemiológica
              </span>
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-6">
          <h3 className="text-base font-semibold text-blue-900 mb-2">
            ¿Necesita editar sus respuestas?
          </h3>
          <p className="text-sm text-blue-700 mb-4">
            Puede revisar y modificar sus ponderaciones en cualquier momento. Los cambios se guardarán automáticamente.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href={`/survey/${token}/summary`}
              className="inline-flex items-center rounded-full bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 transition"
            >
              Ver y editar respuestas
            </Link>
            <Link
              href={`/survey/${token}/strategies`}
              className="inline-flex items-center rounded-full border-2 border-blue-600 px-6 py-3 font-semibold text-blue-600 hover:bg-blue-50 transition"
            >
              Ir a estrategias
            </Link>
          </div>
        </div>

        <div className="text-sm text-slate-500">
          Si ha terminado, puede cerrar esta ventana. Si tiene preguntas, contacte al equipo de investigación.
        </div>
      </div>
    </div>
  );
}
