export type IndicatorAllocation = {
  weight: number;
  threshold: string | null;
};

export type StrategyEvaluationMode = "weighted" | "skipped";

export type StrategyEvaluation = {
  mode: StrategyEvaluationMode;
  skipReason?: string;
};

export type StrategyImportanceRating = 0 | 1 | 2 | 3 | 4 | 5;

export const createEmptyAllocation = (): IndicatorAllocation => ({
  weight: 0,
  threshold: null,
});

export const cloneAllocationState = (
  state: Record<string, IndicatorAllocation>
): Record<string, IndicatorAllocation> =>
  Object.fromEntries(
    Object.entries(state).map(([id, data]) => [
      id,
      {
        weight: data.weight,
        threshold: data.threshold,
      },
    ])
  );
