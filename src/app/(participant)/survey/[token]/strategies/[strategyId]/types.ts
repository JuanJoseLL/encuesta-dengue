export type IndicatorAllocation = {
  weight: number;
  threshold: number | null;
  thresholdRaw?: string; // Raw input value for threshold
};

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
        thresholdRaw: data.thresholdRaw,
      },
    ])
  );

export const THRESHOLD_ERROR_MESSAGE =
  "Verifica que el umbral sea un valor válido mayor a 0%.";
