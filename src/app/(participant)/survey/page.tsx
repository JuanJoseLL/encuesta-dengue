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

  const handleSetRole = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRole) {
      setError("Por favor selecciona tu rol profesional");
      return;
    }

    if (!consentimiento) {
      setError("Debe aceptar el consentimiento informado para continuar");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/respondents/by-email`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: respondent.email, role: selectedRole }),
      });

      if (!response.ok) {
        throw new Error("Error al establecer el rol");
      }

      const data = await response.json();
      proceedToSurvey(data.respondent.token);
    } catch (err: any) {
      setError(err.message || "Error al establecer el rol");
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
      router.push(`/survey/${token}/strategies`);
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
              Ingrese su correo electrónico para acceder a la encuesta.
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

        {/* Role Selection Card */}
        {needsRole && respondent && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
            <button
              type="button"
              onClick={() => {
                setNeedsRole(false);
                setRespondent(null);
                setEmail("");
                setError("");
                setSelectedRole("");
                setConsentimiento(false);
              }}
              className="mb-4 flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver
            </button>
            <h2 className="text-xl font-semibold text-slate-900">
              Bienvenido/a, {respondent.name}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Para continuar, por favor indique su rol profesional y acepte el consentimiento informado.
            </p>

            <form onSubmit={handleSetRole} className="mt-6 space-y-4">
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-2">
                  Rol Profesional
                </label>
                <select
                  id="role"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  disabled={loading}
                >
                  <option value="">Seleccione su rol...</option>
                  {ROLES.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-slate-500">
                  Este rol no podrá ser modificado posteriormente
                </p>
              </div>

              {/* Consentimiento Informado */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
                <h4 className="text-sm font-semibold text-slate-900 mb-4">
                  Consentimiento informado y autorización para el tratamiento de Datos personales
                </h4>
                <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
                  <p>
                    <strong>Consentimiento informado y tratamiento de datos personales</strong>
                  </p>
                  <p>
                    Al participar en esta encuesta, declaro que he sido informado(a) sobre el propósito del estudio: Analizar y ponderar indicadores que permitan definir estrategias efectivas para mitigar el dengue, como parte del proyecto DengueIA.
                  </p>
                  <p>
                    <strong>Sobre el uso de los datos:</strong> Los datos que usted suministre se usarán únicamente para:
                  </p>
                  <ul className="list-inside list-disc pl-4 text-xs text-slate-700">
                    <li>Definir criterios de decisión en un modelo prescriptivo.</li>
                    <li>Desarrollar estrategias de recomendación basadas en evidencia.</li>
                    <li>Fines académicos, científicos y de análisis institucional.</li>
                  </ul>
                  <p>
                    Autorizo de manera libre, expresa e informada el uso de mis datos personales y mis respuestas, exclusivamente para los fines anteriormente descritos.
                  </p>
                  <p>
                    Entiendo que:
                  </p>
                  <ul className="list-inside list-disc pl-4 text-xs text-slate-700">
                    <li>Mi participación es completamente voluntaria.</li>
                    <li>Puedo retirarme en cualquier momento sin repercusiones.</li>
                    <li>La información será tratada de forma confidencial, anónima y conforme a la Ley 1581 de 2012 (Colombia) y otras normativas internacionales de protección de datos.</li>
                  </ul>
                  <p>
                    Declaro haber leído y aceptado este consentimiento informado.
                  </p>
                </div>
                <div className="mt-4 flex items-start gap-3">
                  <input
                    id="consentimiento"
                    type="checkbox"
                    checked={consentimiento}
                    onChange={(e) => setConsentimiento(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    disabled={loading}
                  />
                  <label htmlFor="consentimiento" className="text-sm text-slate-700 leading-relaxed">
                    <strong>Declaro haber leído y acepto el consentimiento informado y la autorización para el tratamiento de datos personales.</strong>
                  </label>
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800">
                  <strong>Error:</strong> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={!selectedRole || !consentimiento || loading}
                className="w-full rounded-full bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Guardando..." : "Continuar a la encuesta →"}
              </button>
            </form>
          </div>
        )}

        {/* Info Card */}
        {!needsRole && !respondent && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">¿En qué consiste esta encuesta?</h3>
            <div className="mt-4 text-sm text-slate-600">
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="font-semibold text-blue-600">•</span>
                  <span>Usted evaluará <strong>19 estrategias</strong> de mitigación del dengue.</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold text-blue-600">•</span>
                  <div>
                    <span>Para cada estrategia, deberá:</span>
                    <ol className="mt-2 ml-6 list-decimal space-y-1 text-sm text-slate-600">
                      <li>Seleccionar los indicadores más relevantes.</li>
                      <li>Asignar un peso porcentual a cada uno.</li>
                      <li>Asegurarse de que la suma de los pesos por estrategia sea del 100%.</li>
                    </ol>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold text-blue-600">•</span>
                  <span className="italic">El sistema guarda automáticamente su progreso. Puede continuar en diferentes sesiones.</span>
                </li>
              </ul>
              <div className="mt-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
                <strong>Tiempo estimado:</strong> 25 a 35 minutos
              </div>
            </div>
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

