"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiRoutes } from "@/lib/api/routes";
import Image from "next/image";

const ROLES = [
  { value: "epidemiologist", label: "Epidemiólogo/a" },
  { value: "entomologist", label: "Entomólogo/a" },
  { value: "biologist", label: "Biólogo/a" },
  { value: "public-health", label: "Profesional de Salud Pública" },
  { value: "policy-maker", label: "Tomador de Decisiones / Política Pública" },
  { value: "other", label: "Otro" },
];

export default function SurveyLoginPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [respondent, setRespondent] = useState<any>(null);
  const [needsRole, setNeedsRole] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [consentimiento, setConsentimiento] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const checkRespondent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError("Por favor ingresa tu correo electrónico");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/respondents/by-email?email=${encodeURIComponent(email)}`);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "No se encontró un participante con este correo");
      }

      const data = await response.json();
      setRespondent(data.respondent);

      // Si no tiene rol, necesitamos pedirlo
      if (!data.respondent.role) {
        setNeedsRole(true);
      } else {
        // Si ya tiene rol, proceder directamente
        proceedToSurvey(data.respondent.token);
      }
    } catch (err: any) {
      setError(err.message || "Error al verificar el correo");
    } finally {
      setLoading(false);
    }
  };

  const proceedToSurvey = async (token: string) => {
    try {
      // Verificar que la sesión exista o crearla
      const sessionResponse = await fetch(apiRoutes.sessionGet(token));
      
      if (!sessionResponse.ok) {
        throw new Error("No se pudo acceder a la sesión");
      }

      // Redirigir a la lista de estrategias
      router.push(`/2ndIteration/${token}/strategies`);
    } catch (err) {
      setError("Error al acceder a la encuesta");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-slate-50 px-6 py-12">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Header */}
        <div className="space-y-4 text-center">
          <div className="flex justify-center mb-6">
            <Image
              src="/Logo Dengue-IA color negativo.png"
              alt="Logo Dengue-IA Cali"
              width={200}
              height={100}
              className="object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-slate-900">
            Ponderación de indicadores para priorizar estrategias de respuesta al dengue en Cali
          </h1>
          <p className="text-lg text-slate-600">
            Su participación nos ayudará a construir un sistema inteligente de apoyo a decisiones basado en evidencia real y contextualizada en Cali.
          </p>
        </div>

        {/* Email Input Card */}
        {!needsRole && !respondent && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
            <h2 className="text-xl font-semibold text-slate-900">Acceso a la Encuesta</h2>
            <p className="mt-2 text-sm text-slate-600">
              Ingrese su correo electrónico para acceder a la segunda iteración de la encuesta.
            </p>

            <form onSubmit={checkRespondent} className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Correo Electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  disabled={loading}
                />
                <p className="mt-1 text-xs text-slate-500">
                  Debe estar registrado previamente por el administrador
                </p>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800">
                  <strong>Error:</strong> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={!email.trim() || loading}
                className="w-full rounded-full bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Verificando..." : "Acceder"}
              </button>
            </form>
          </div>
        )}

        {/* Help */}
        <div className="text-center text-sm text-slate-500">
          ¿Problemas para acceder? Contacta al equipo de investigación
        </div>
      </div>
    </main>
  );
}

