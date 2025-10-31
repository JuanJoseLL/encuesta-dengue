"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const SURVEY_ID = "survey-dengue-2025";

interface Survey {
  id: string;
  title: string;
  version: string;
  totalStrategies: number;
  active: boolean;
}

export default function AdminExportsPage() {
  const [exporting, setExporting] = useState<"csv" | "excel" | null>(null);
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSurvey() {
      try {
        const response = await fetch(`/api/surveys/${SURVEY_ID}`);

        if (!response.ok) {
          throw new Error("Failed to load survey");
        }

        const data = await response.json();
        if (!data?.survey) {
          throw new Error("Malformed survey response");
        }

        setSurvey({
          id: data.survey.id,
          title: data.survey.title,
          version: data.survey.version,
          active: Boolean(data.survey.active),
          totalStrategies: Array.isArray(data.strategies) ? data.strategies.length : 0,
        });
      } catch (err) {
        console.error("Error loading survey:", err);
        setError("Error al cargar la información de la encuesta");
      } finally {
        setLoading(false);
      }
    }

    loadSurvey();
  }, []);

  const handleExport = async (format: "csv" | "excel") => {
    setExporting(format);
    try {
      const endpoint = format === "csv" ? "csv" : "excel";
      const response = await fetch(`/api/admin/exports/${endpoint}?surveyId=${SURVEY_ID}`);

      if (!response.ok) {
        throw new Error("Failed to export data");
      }

      const blob = await response.blob();

      // Crear link de descarga
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const extension = format === "csv" ? "csv" : "xlsx";
      a.download = `encuesta-dengue-${new Date().toISOString().split("T")[0]}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("Error al exportar datos");
      console.error(error);
    } finally {
      setExporting(null);
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
                <li>Estrategia e indicador seleccionado</li>
                <li>Calificación de importancia (0-5)</li>
                <li>Peso asignado (0-100)</li>
                <li>Timestamp de respuesta</li>
              </ul>
            </div>

            <button
              onClick={() => handleExport("csv")}
              disabled={exporting !== null}
              className="mt-6 w-full rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {exporting === "csv" ? "Generando..." : "Descargar CSV"}
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-3-3v6m8 2a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h7.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V17z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Exportar a Excel</h2>
                <p className="text-sm text-slate-600">Reporte profesional en .xlsx listo para análisis</p>
              </div>
            </div>

            <div className="mt-6 space-y-2 text-sm text-slate-600">
              <p>El archivo Excel incluye:</p>
              <ul className="ml-4 list-disc space-y-1">
                <li>Detalle de participantes, roles y organizaciones</li>
                <li>Estrategias e indicadores consolidados por sesión</li>
                <li>Calificación de importancia por estrategia (0-5)</li>
                <li>Peso otorgado por indicador (0-100)</li>
                <li>Fechas de inicio, finalización y actualización</li>
              </ul>
            </div>

            <button
              onClick={() => handleExport("excel")}
              disabled={exporting !== null}
              className="mt-6 w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {exporting === "excel" ? "Generando..." : "Descargar Excel"}
            </button>
          </div>
        </section>

        {/* Export Info */}
        {loading ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="text-center text-slate-600">Cargando información de la encuesta...</div>
          </section>
        ) : error ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="text-center text-red-600">{error}</div>
          </section>
        ) : survey ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Información de la Encuesta</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-slate-700">Título</p>
                <p className="mt-1 text-slate-900">{survey.title}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Versión</p>
                <p className="mt-1 text-slate-900">{survey.version}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Total de estrategias</p>
                <p className="mt-1 text-slate-900">{survey.totalStrategies}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Estado</p>
                <p className="mt-1">
                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                    {survey.active ? "Activa" : "Inactiva"}
                  </span>
                </p>
              </div>
            </div>
          </section>
        ) : null}

        {/* Usage Guide */}
        <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6">
          <h3 className="font-semibold text-slate-900">Guía de uso</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div>
              <strong className="text-slate-900">Estructura del CSV:</strong>
              <pre className="mt-2 overflow-x-auto rounded-lg bg-white p-3 text-xs">
respondent_id,role,strategy_title,importance_rating,indicator_name,weight,timestamp
resp-001,epidemiologist,Estrategia ABC,5,Indicador XYZ,25.0,2025-01-16T12:00:00Z
              </pre>
            </div>
            <div>
              <strong className="text-slate-900">Análisis sugeridos:</strong>
              <ul className="mt-2 ml-4 list-disc space-y-1">
                <li>Consenso entre roles profesionales por estrategia</li>
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
