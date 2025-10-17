export type IndicatorAllocation = {
  weight: number;
  threshold: number | null;
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
      },
    ])
  );

export const THRESHOLD_ERROR_MESSAGE =
  "Verifica que el umbral sea un valor válido mayor a 0%.";
