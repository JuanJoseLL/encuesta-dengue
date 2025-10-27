import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="mx-auto flex max-w-5xl flex-col gap-12 px-6 pb-16 pt-24">
        <section className="space-y-6 text-center">
          <div className="flex justify-center mb-8">
            <Image
              src="/Logo Dengue-IA color negativo.png"
              alt="Dengue IA Logo"
              width={300}
              height={120}
              priority
              className="h-auto w-auto max-w-xs"
            />
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Herramienta de Asistencia para Elicitación de Juicio de Expertos para la Mitigación del Dengue en Santiago de Cali
          </span>
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
            Ponderación de indicadores para priorizar estrategias de respuesta al dengue en Cali
          </h1>
          <div className="mx-auto max-w-3xl space-y-4 text-base leading-relaxed text-slate-600">
            <p>
              <strong>Estimado(a) experto(a):</strong>
            </p>
            <p>
            Con su valiosa participación contribuirá a la parametrización de un modelo prescriptivo para generar recomendaciones contextualizadas para la mitigación del Dengue en Cali.
            </p>
            <p>
              En esta encuesta se presentan diversas estrategias de intervención junto con indicadores asociados. Se solicita que:
            </p>
            <ul className="text-left space-y-2 mx-auto max-w-2xl">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Revise cuidadosamente cada estrategia.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Asigne un porcentaje de relevancia a los indicadores que considere más determinantes para su aplicación, de modo que la suma total alcance el 100%.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Si lo considera pertinente, proponga indicadores adicionales que, a su juicio, deberían incluirse para una evaluación más precisa de la estrategia.</span>
              </li>
            </ul>
            <p className="mt-4">
              La información recopilada será utilizada exclusivamente con fines analíticos y contribuirá al diseño de un modelo de inteligencia artificial basado en evidencia y conocimiento experto.
            </p>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">¿Eres participante?</h2>
            <p className="mt-2 text-sm text-slate-600">
              Accede con su correo electrónico para comenzar o continuar la encuesta. 
              Su progreso se guarda automáticamente y puedes retomar en cualquier momento.
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
              resultados consolidados en CSV o XLSX según las necesidades del equipo investigador.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Ir al panel administrativo
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
