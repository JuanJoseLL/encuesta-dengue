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
          <h1 className="text-4xl font-bold text-slate-900">Encuesta enviada con éxito</h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Gracias por ser parte activa de esta iniciativa de salud pública. Tu participación como experto(a) es fundamental para construir un modelo prescriptivo sólido, basado en evidencia local, que contribuirá a mejorar la toma de decisiones frente a brotes de dengue en Santiago de Cali.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">¿Qué sigue ahora?</h2>
          <ul className="space-y-3 text-left text-sm text-slate-600">
            <li className="flex gap-3">
              <span className="text-green-600 flex-shrink-0">•</span>
              <span>
                Tus aportes han sido registrados de forma segura, anónima y serán analizados junto a los de otros participantes.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-600 flex-shrink-0">•</span>
              <span>
                El equipo técnico consolidará las ponderaciones para afinar el sistema de recomendación del modelo.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-600 flex-shrink-0">•</span>
              <span>
                Los resultados apoyarán el fortalecimiento de los sistemas de vigilancia epidemiológica y las respuestas intersectoriales frente al dengue.
              </span>
            </li>
          </ul>
          <p className="mt-6 text-sm text-slate-700 italic border-t border-slate-200 pt-4">
            Tu experiencia transforma datos en decisiones. Gracias por ser parte de esta construcción colectiva hacia una Cali más saludable y resiliente.
          </p>
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
