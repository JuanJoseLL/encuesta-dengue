"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Respondent {
  id: string;
  name: string;
  email: string;
  role: string | null;
  createdAt: string;
  sessionCount: number;
  lastInvite: {
    token: string;
    status: string;
    expiresAt: string;
  } | null;
}

export default function AdminRespondentsPage() {
  const [respondents, setRespondents] = useState<Respondent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const surveyId = "survey-dengue-2025";

  useEffect(() => {
    loadRespondents();
  }, []);

  const loadRespondents = async () => {
    try {
      const response = await fetch("/api/admin/respondents");
      if (!response.ok) throw new Error("Error al cargar participantes");
      const data = await response.json();
      setRespondents(data.respondents);
    } catch (err) {
      console.error(err);
      setError("Error al cargar la lista de participantes");
    } finally {
      setLoading(false);
    }
  };

  const handleAddRespondent = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/admin/respondents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          surveyId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al crear participante");
      }

      const data = await response.json();
      setSuccessMessage(`Participante creado exitosamente`);
      await loadRespondents();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    alert("Email copiado al portapapeles");
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/survey`;
    navigator.clipboard.writeText(link);
    alert("Link de invitación copiado al portapapeles");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-slate-600">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Gestión de Participantes
            </h1>
            <p className="mt-2 text-slate-600">
              Administra los participantes y sus tokens de acceso
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/dashboard"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:cursor-pointer"
            >
              ← Volver al Dashboard
            </Link>
            <button
              onClick={() => setShowAddModal(true)}
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 hover:cursor-pointer"
            >
              + Agregar Participante
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-6 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="text-2xl font-bold text-slate-900">
              {respondents.length}
            </div>
            <div className="text-sm text-slate-600">Total Participantes</div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="text-2xl font-bold text-slate-900">
              {respondents.filter((r) => r.role).length}
            </div>
            <div className="text-sm text-slate-600">Con Rol Asignado</div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="text-2xl font-bold text-slate-900">
              {respondents.filter((r) => r.sessionCount > 0).length}
            </div>
            <div className="text-sm text-slate-600">Con Sesiones Activas</div>
          </div>
        </div>

        {/* Respondents Table */}
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Sesiones
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {respondents.map((respondent) => (
                  <tr key={respondent.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {respondent.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {respondent.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {respondent.role ? (
                        <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                          {respondent.role}
                        </span>
                      ) : (
                        <span className="text-slate-400">Sin asignar</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {respondent.sessionCount}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {respondent.lastInvite ? (
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            respondent.lastInvite.status === "completed"
                              ? "bg-blue-100 text-blue-800"
                              : respondent.lastInvite.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {respondent.lastInvite.status}
                        </span>
                      ) : (
                        <span className="text-slate-400">Sin invitación</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyEmail(respondent.email)}
                          className="text-blue-600 hover:underline hover:cursor-pointer"
                          title="Copiar email"
                        >
                          Copiar Email
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Respondent Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
              <h2 className="mb-4 text-xl font-bold text-slate-900">
                Agregar Nuevo Participante
              </h2>

              {error && (
                <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="mb-4 rounded-lg bg-green-50 p-4">
                  <p className="mb-2 text-sm font-medium text-green-800">
                    {successMessage}
                  </p>
                  <div className="mt-3 rounded bg-white p-3">
                    <p className="mb-2 text-xs font-semibold text-slate-700">
                      El participante puede acceder con su correo electrónico:
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-sm font-medium text-blue-600">
                        {newEmail}
                      </code>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleAddRespondent}>
                <div className="mb-4">
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setError("");
                      setSuccessMessage("");
                      setNewName("");
                      setNewEmail("");
                    }}
                    className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:cursor-pointer"
                  >
                    Cerrar
                  </button>
                  <button
                    type="submit"
                    disabled={adding}
                    className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 hover:cursor-pointer"
                  >
                    {adding ? "Creando..." : "Crear Participante"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

