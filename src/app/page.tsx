import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="mx-auto flex max-w-5xl flex-col gap-12 px-6 pb-16 pt-24">
        <section className="space-y-6 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Encuesta de ponderación de indicadores
          </span>
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
            Valida escenarios epidemiológicos de dengue sin fricciones
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-600">
            Plataforma para expertos donde pueden revisar hasta 19 escenarios y asignar pesos a 69
            indicadores posibles. Guarda el progreso automáticamente, permite reanudar más tarde y
            ofrece un resumen final antes del envío.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">¿Eres participante?</h2>
            <p className="mt-2 text-sm text-slate-600">
              Accede con tu token único, confirma tu rol y comienza el wizard de escenarios. Podrás
              copiar pesos del escenario previo y autorrepartir el porcentaje restante.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/survey/demo-token"
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Ingresar con token
              </Link>
              <span className="text-xs text-slate-400">
                Sustituye <code className="rounded bg-slate-100 px-1 py-0.5">demo-token</code> por tu token real.
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">¿Eres administrador?</h2>
            <p className="mt-2 text-sm text-slate-600">
              Supervisa el avance de las sesiones, gestiona escenarios e indicadores y exporta los
              resultados consolidados en CSV o JSON según las necesidades del equipo investigador.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Ir al panel administrativo
              </Link>
              <span className="text-xs text-slate-400">Acceso protegido pendiente de integración.</span>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-sm text-slate-600">
          <h2 className="text-base font-semibold text-slate-900">Siguientes integraciones</h2>
          <ul className="mt-4 space-y-2">
            <li>- Conectar endpoints descritos en el PRD.</li>
            <li>- Añadir persistencia segura de sesiones y autosave con debounce.</li>
            <li>- Completar flujos de validación (pesos = 100%, “No aplica”).</li>
            <li>- Internationalización es/en y métricas de completitud (KPIs).</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
