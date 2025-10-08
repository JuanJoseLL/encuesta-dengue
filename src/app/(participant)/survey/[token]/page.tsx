"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PARTICIPANT_ROLES, PARTICIPANT_ROLE_LABELS, ParticipantRole } from "@/domain/constants/roles";
import { mockApi } from "@/lib/mock/api";

export default function SurveyWelcomePage({ params }: { params: Promise<{ token: string }> }) {
  const router = useRouter();
  const { token } = use(params);

  const [selectedRole, setSelectedRole] = useState<ParticipantRole | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [surveyData, setSurveyData] = useState<{ title: string; totalScenarios: number } | null>(null);

  useEffect(() => {
    // Cargar datos de la encuesta
    mockApi
      .getSurveyDefinition("survey-dengue-2025")
      .then((data) => {
        setSurveyData({
          title: data.survey.title,
          totalScenarios: data.survey.totalScenarios,
        });
      })
      .catch((err) => {
        setError("No se pudo cargar la encuesta");
        console.error(err);
      });
  }, []);

  const handleStart = async () => {
    if (!selectedRole) {
      setError("Por favor selecciona tu rol antes de continuar");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Crear sesión
      await mockApi.getOrCreateSession(token);

      // Guardar rol en localStorage
      localStorage.setItem(`session-${token}-role`, selectedRole);

      // Redirigir a lista de escenarios
      router.push(`/survey/${token}/scenarios`);
    } catch (err) {
      setError("Error al iniciar la sesión. Por favor intenta nuevamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!surveyData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-slate-600">Cargando encuesta...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-slate-50 px-6 py-12">
      <div className="mx-auto max-w-3xl space-y-8">
        {/* Header */}
        <div className="space-y-4 text-center">
          <div className="inline-block rounded-full bg-blue-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-blue-700">
            Encuesta de Validación
          </div>
          <h1 className="text-3xl font-bold text-slate-900">{surveyData.title}</h1>
          <p className="text-slate-600">
            Gracias por participar en esta investigación. Tu experiencia como experto/a es fundamental para validar
            los indicadores epidemiológicos.
          </p>
        </div>

        {/* Info Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">¿Cómo funciona?</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li className="flex gap-3">
              <span className="font-semibold text-blue-600">1.</span>
              <span>
                Revisarás <strong>{surveyData.totalScenarios} escenarios epidemiológicos</strong> diferentes
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-blue-600">2.</span>
              <span>
                En cada escenario, seleccionarás los <strong>indicadores más relevantes</strong> y asignarás pesos
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-blue-600">3.</span>
              <span>
                Los pesos deben sumar exactamente <strong>100%</strong> por escenario
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-blue-600">4.</span>
              <span>
                Tu progreso se <strong>guarda automáticamente</strong>, puedes salir y volver cuando quieras
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-blue-600">5.</span>
              <span>
                Al final, revisarás un <strong>resumen completo</strong> antes de enviar
              </span>
            </li>
          </ul>
          <div className="mt-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
            <strong>Tiempo estimado:</strong> 25-35 minutos (puedes completar en múltiples sesiones)
          </div>
        </div>

        {/* Role Selection */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Selecciona tu rol profesional</h2>
          <p className="mt-2 text-sm text-slate-600">
            Esta información nos ayuda a analizar las respuestas según perfiles de especialización
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {PARTICIPANT_ROLES.map((role) => (
              <label
                key={role}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition ${
                  selectedRole === role
                    ? "border-blue-600 bg-blue-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={role}
                  checked={selectedRole === role}
                  onChange={(e) => setSelectedRole(e.target.value as ParticipantRole)}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="font-medium text-slate-900">{PARTICIPANT_ROLE_LABELS[role]}</span>
              </label>
            ))}
          </div>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-800">
              <strong>Atención:</strong> {error}
            </div>
          )}

          <button
            onClick={handleStart}
            disabled={!selectedRole || loading}
            className="mt-6 w-full rounded-full bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Iniciando..." : "Comenzar encuesta →"}
          </button>
        </div>
      </div>
    </main>
  );
}
