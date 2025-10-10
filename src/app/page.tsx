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
            Ponderación de Indicadores para Estrategias de Mitigación del Dengue
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-600">
            Plataforma para expertos donde pueden revisar 19 estrategias de mitigación y ponderar
            69 indicadores epidemiológicos. Guarda el progreso automáticamente y permite reanudar
            cuando sea necesario.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">¿Eres participante?</h2>
            <p className="mt-2 text-sm text-slate-600">
              Accede con tu número de cédula para comenzar o continuar la encuesta. Tu progreso se
              guarda automáticamente y puedes retomar en cualquier momento.
            </p>
            <div className="mt-6">
              <Link
                href="/survey"
                className="inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Acceder a la encuesta →
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">¿Eres administrador?</h2>
            <p className="mt-2 text-sm text-slate-600">
              Supervisa el avance de las sesiones, gestiona estrategias e indicadores y exporta los
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
      </div>
    </main>
  );
}
