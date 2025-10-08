interface ProgressBarProps {
  value: number; // between 0 and 1
  label?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses: Record<NonNullable<ProgressBarProps["size"]>, string> = {
  sm: "h-2",
  md: "h-3",
  lg: "h-4",
};

export function ProgressBar({ value, label, size = "md" }: ProgressBarProps) {
  const clamped = Math.min(Math.max(value, 0), 1);
  return (
    <div className="w-full">
      {label ? (
        <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
          <span>{label}</span>
          <span className="font-mono">{Math.round(clamped * 100)}%</span>
        </div>
      ) : null}
      <div className={`relative w-full overflow-hidden rounded-full bg-slate-200 ${sizeClasses[size]}`}>
        <span
          className="absolute inset-y-0 left-0 rounded-full bg-slate-900 transition-all"
          style={{ width: `${clamped * 100}%` }}
        />
      </div>
    </div>
  );
}
