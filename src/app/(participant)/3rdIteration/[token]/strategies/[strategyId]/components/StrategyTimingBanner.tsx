import { getStrategyLeadTime } from "@/domain/constants/thirdIteration";

/**
 * Banner de encuadre para la tercera iteración. Fusiona en un solo bloque:
 *  - el contexto de los indicadores que inciden en la estrategia,
 *  - el tiempo que le toma a la brigada ponerla en ejecución en terreno
 *    (proveniente del Excel «19_Estrategias_definitivas.xlsx»),
 *  - la pregunta sobre el peso de cada indicador (en la escala real de la
 *    página: pesos que suman 100%),
 *  - las instrucciones de consenso ya existentes.
 */
export function StrategyTimingBanner({ codigo }: { codigo?: string | null }) {
  const leadTime = getStrategyLeadTime(codigo);

  return (
    <div className="rounded-2xl border-2 border-indigo-700 bg-gradient-to-br from-indigo-600 to-indigo-800 p-5 shadow-lg">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg
            className="h-6 w-6 text-indigo-100"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="flex-1 space-y-3">
          <h3 className="text-base font-bold text-white">
            Consenso final · ¿Cuánto pesa cada indicador?
          </h3>

          <p className="text-sm leading-relaxed text-indigo-50">
            Para esta estrategia, a continuación se listan los indicadores que,
            según la ronda anterior, inciden para que sea recomendada.
          </p>

          <p className="text-sm leading-relaxed text-indigo-50">
            Con esto en mente, ¿cuál es su mejor apuesta para el peso de cada
            indicador? Los pesos (que deben sumar{" "}
            <strong className="font-bold text-white">100%</strong>) reflejan el
            grado en que usted recomendaría la estrategia cuando el
            indicador se manifiesta. Por ejemplo, asignar un peso moderado —digamos{" "}
            <strong className="font-bold text-white">40%</strong>— al indicador de
            pluviosidad significa que, con la sola información de los indicadores,
            ese indicador inclina en un 40% su recomendación para poner en marcha la
            estrategia cuando se cumple el indicador
            {leadTime ? (
              <>
                {" "}
                —p. ej., si en los{" "}
                <strong className="font-bold text-white">
                  últimos {leadTime}
                </strong>{" "}
                ha llovido por encima del percentil 90.
              </>
            ) : (
              "."
            )}
          </p>

          <p className="text-sm leading-relaxed text-indigo-50">
            A continuación verá las ponderaciones de cada experto y el{" "}
            <strong className="font-bold text-white">promedio del grupo</strong>{" "}
            de la iteración anterior. Ajuste sus pesos buscando el{" "}
            <strong className="font-bold text-white">consenso final</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
