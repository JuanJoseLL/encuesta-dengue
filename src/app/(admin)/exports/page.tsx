"use client";

import { useState } from "react";
import Link from "next/link";
import { mockApi } from "@/lib/mock/api";
import { MOCK_SURVEY } from "@/lib/mock/data";

export default function AdminExportsPage() {
  const [exporting, setExporting] = useState(false);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const blob = await mockApi.exportCSV(MOCK_SURVEY.id);

      // Crear link de descarga
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `encuesta-dengue-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("Error al exportar datos");
      console.error(error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 px-6 py-12">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <header>
          <Link href="/admin/dashboard" className="text-sm text-blue-600 hover:underline">
            ← Volver al dashboard
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-slate-900">Exportación de Datos</h1>
          <p className="mt-2 text-slate-600">
            Descarga los datos consolidados de todas las sesiones para análisis estadístico
          </p>
        </header>

        {/* Export Options */}
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Exportar a CSV</h2>
                <p className="text-sm text-slate-600">Formato tabular para Excel/SPSS/R</p>
              </div>
            </div>

            <div className="mt-6 space-y-2 text-sm text-slate-600">
              <p>El archivo CSV incluye:</p>
              <ul className="ml-4 list-disc space-y-1">
                <li>ID de participante y rol</li>
                <li>Escenario e indicador seleccionado</li>
                <li>Peso asignado (0-100)</li>
                <li>Timestamp de respuesta</li>
              </ul>
            </div>

            <button
              onClick={handleExportCSV}
              disabled={exporting}
              className="mt-6 w-full rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {exporting ? "Generando..." : "Descargar CSV"}
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm opacity-60">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Exportar a JSON</h2>
                <p className="text-sm text-slate-600">Formato estructurado completo</p>
              </div>
            </div>

            <div className="mt-6 space-y-2 text-sm text-slate-600">
              <p>El archivo JSON incluye:</p>
              <ul className="ml-4 list-disc space-y-1">
                <li>Metadata completa de la encuesta</li>
                <li>Estructura jerárquica de respuestas</li>
                <li>Información adicional de sesiones</li>
                <li>Timestamps detallados</li>
              </ul>
            </div>

            <button
              disabled
              className="mt-6 w-full rounded-lg border border-slate-200 bg-slate-50 px-6 py-3 font-semibold text-slate-400 cursor-not-allowed"
            >
              Próximamente
            </button>
          </div>
        </section>

        {/* Export Info */}
        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Información de la Encuesta</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-slate-700">Título</p>
              <p className="mt-1 text-slate-900">{MOCK_SURVEY.title}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">Versión</p>
              <p className="mt-1 text-slate-900">{MOCK_SURVEY.version}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">Total de escenarios</p>
              <p className="mt-1 text-slate-900">{MOCK_SURVEY.totalScenarios}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">Estado</p>
              <p className="mt-1">
                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                  {MOCK_SURVEY.active ? "Activa" : "Inactiva"}
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* Usage Guide */}
        <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6">
          <h3 className="font-semibold text-slate-900">Guía de uso</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div>
              <strong className="text-slate-900">Estructura del CSV:</strong>
              <pre className="mt-2 overflow-x-auto rounded-lg bg-white p-3 text-xs">
respondent_id,role,scenario_id,indicator_id,weight,timestamp
resp-001,epidemiologist,SCN-001,IND-001,25.0,2025-01-16T12:00:00Z
              </pre>
            </div>
            <div>
              <strong className="text-slate-900">Análisis sugeridos:</strong>
              <ul className="mt-2 ml-4 list-disc space-y-1">
                <li>Consenso entre roles profesionales por escenario</li>
                <li>Indicadores más y menos valorados globalmente</li>
                <li>Variabilidad de ponderaciones por indicador</li>
                <li>Correlaciones entre indicadores según contexto epidemiológico</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
