import { IndicatorWeightDraft } from "@/domain/models";

export const TOTAL_WEIGHT_TARGET = 100;

export function calculateTotalWeight(weights: IndicatorWeightDraft[]): number {
  return weights.reduce((acc, item) => acc + (Number.isFinite(item.weight) ? item.weight : 0), 0);
}

export function getRemainingWeight(weights: IndicatorWeightDraft[]): number {
  return TOTAL_WEIGHT_TARGET - calculateTotalWeight(weights);
}

export function autoDistributeWeights(weights: IndicatorWeightDraft[]): IndicatorWeightDraft[] {
  const remaining = getRemainingWeight(weights);
  if (remaining === 0 || weights.length === 0) {
    return weights;
  }

  const delta = remaining / weights.length;
  return weights.map((item) => ({
    ...item,
    weight: Math.max(0, Math.round((item.weight + delta) * 10) / 10),
  }));
}

export function normalizeWeights(weights: IndicatorWeightDraft[]): IndicatorWeightDraft[] {
  const total = calculateTotalWeight(weights);
  if (total === 0) {
    return weights;
  }

  return weights.map((item) => ({
    ...item,
    weight: Math.round(((item.weight / total) * TOTAL_WEIGHT_TARGET) * 10) / 10,
  }));
}
