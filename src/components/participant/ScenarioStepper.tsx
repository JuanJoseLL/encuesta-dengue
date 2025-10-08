import Link from "next/link";

interface ScenarioStep {
  id: string;
  title: string;
  status: "pending" | "in-progress" | "completed" | "not-applicable";
}

interface ScenarioStepperProps {
  token: string;
  currentScenarioId?: string;
  steps: ScenarioStep[];
}

const statusClasses: Record<ScenarioStep["status"], string> = {
  pending: "border-slate-200 text-slate-500",
  "in-progress": "border-amber-300 bg-amber-50 text-amber-700",
  completed: "border-emerald-300 bg-emerald-50 text-emerald-700",
  "not-applicable": "border-slate-200 bg-slate-50 text-slate-500",
};

export function ScenarioStepper({ token, currentScenarioId, steps }: ScenarioStepperProps) {
  return (
    <ol className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-600">
      {steps.map((step, index) => (
        <li key={step.id}>
          <Link
            href={`/survey/${token}/scenarios/${step.id}`}
            className={`flex items-center justify-between rounded-xl border px-3 py-2 transition hover:border-slate-300 ${
              statusClasses[step.status]
            } ${step.id === currentScenarioId ? "ring-2 ring-slate-300" : ""}`}
          >
            <span className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-slate-400">{index + 1}</span>
              <span className="font-medium text-slate-700">{step.title}</span>
            </span>
            <span className="uppercase tracking-[0.2em] text-[10px] text-slate-400">{step.status}</span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
