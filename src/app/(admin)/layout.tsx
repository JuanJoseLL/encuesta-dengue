"use client";

import { useState, useEffect, type ReactNode } from "react";

const ADMIN_PASSWORD = "DengueIa-2025";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Verificar si ya está autenticado en el sessionStorage
  useEffect(() => {
    const authenticated = sessionStorage.getItem("admin_authenticated");
    if (authenticated === "true") {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem("admin_authenticated", "true");
      setError("");
    } else {
      setError("Clave incorrecta");
      setPassword("");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("admin_authenticated");
    setPassword("");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 via-white to-slate-50 px-6">
        <div className="max-w-md w-full">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Panel de Administración</h1>
              <p className="mt-2 text-sm text-slate-600">
                Ingrese la clave de acceso para continuar
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                  Clave de Acceso
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingrese la clave"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  autoFocus
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800">
                  <strong>Error:</strong> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={!password.trim()}
                className="w-full rounded-full bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Acceder
              </button>
            </form>

            <div className="mt-4 text-center">
              <a
                href="/"
                className="text-sm text-slate-500 hover:text-slate-700 underline"
              >
                Volver al inicio
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950/5">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pb-24 pt-12 sm:px-8">
        <header className="flex flex-col gap-1 relative">
          <div className="absolute right-0 top-0">
            <button
              onClick={handleLogout}
              className="text-xs text-slate-500 hover:text-slate-700 underline"
            >
              Cerrar sesión
            </button>
          </div>
          <span className="text-xs uppercase tracking-[0.28em] text-slate-400">Panel administrativo</span>
          <h1 className="text-2xl font-semibold text-slate-900">Encuesta de indicadores de dengue</h1>
          <p className="text-sm text-slate-500">Gestiona estrategias, sesiones activas y exportaciones.</p>
        </header>
        {children}
      </div>
    </div>
  );
}
