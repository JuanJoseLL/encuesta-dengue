"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiRoutes } from "@/lib/api/routes";

export default function SurveyLoginPage() {
  const router = useRouter();
  
  const [cedula, setCedula] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cedula.trim()) {
      setError("Por favor ingresa tu cédula");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Intentar cargar la sesión con el token (cédula)
      const response = await fetch(apiRoutes.sessionGet(cedula));

      if (!response.ok) {
        throw new Error("Failed to get session");
      }

      const sessionData = await response.json();
      
      // Redirigir a la lista de estrategias
      router.push(`/survey/${cedula}/strategies`);
    } catch (err) {
      setError("No se pudo acceder con esta cédula. Por favor verifica que sea correcta o contacta al administrador.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-slate-50 px-6 py-12">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Header */}
        <div className="space-y-4 text-center">
          <div className="inline-block rounded-full bg-blue-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-blue-700">
            Encuesta de Validación
          </div>
          <h1 className="text-4xl font-bold text-slate-900">
            Ponderación de Indicadores para Estrategias de Mitigación del Dengue
          </h1>
          <p className="text-lg text-slate-600">
            Gracias por participar en esta investigación. Tu experiencia como experto/a es fundamental.
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
          <h2 className="text-xl font-semibold text-slate-900">Acceso con tu identificación</h2>
          <p className="mt-2 text-sm text-slate-600">
            Ingresa tu número de cédula para acceder a la encuesta. Tu progreso se guardará automáticamente.
          </p>

          <form onSubmit={handleAccess} className="mt-6 space-y-4">
            <div>
              <label htmlFor="cedula" className="block text-sm font-medium text-slate-700 mb-2">
                Número de cédula
              </label>
              <input
                id="cedula"
                type="text"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                placeholder="Ejemplo: 1234567890"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800">
                <strong>Error:</strong> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!cedula.trim() || loading}
              className="w-full rounded-full bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Accediendo..." : "Acceder a la encuesta →"}
            </button>
          </form>
        </div>

        {/* Info Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Sobre la encuesta</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li className="flex gap-3">
              <span className="font-semibold text-blue-600">•</span>
              <span>
                Ponderarás <strong>19 estrategias de mitigación</strong> del dengue
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-blue-600">•</span>
              <span>
                Para cada estrategia, seleccionarás los indicadores más relevantes y asignarás pesos
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-blue-600">•</span>
              <span>
                Los pesos se asignan de <strong>5 en 5%</strong> y deben sumar <strong>100%</strong> por estrategia
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-blue-600">•</span>
              <span>
                Tu progreso se <strong>guarda automáticamente</strong> - puedes salir y volver cuando quieras
              </span>
            </li>
          </ul>
          <div className="mt-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
            <strong>Tiempo estimado:</strong> 25-35 minutos (puedes completar en múltiples sesiones)
          </div>
        </div>

        {/* Help */}
        <div className="text-center text-sm text-slate-500">
          ¿Problemas para acceder? Contacta al equipo de investigación
        </div>
      </div>
    </main>
  );
}

