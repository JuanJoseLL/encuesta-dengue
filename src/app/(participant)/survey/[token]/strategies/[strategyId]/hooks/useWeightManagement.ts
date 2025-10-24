import { useState, useRef, useCallback } from "react";
import type { IndicatorAllocation } from "../types";
import { createEmptyAllocation, cloneAllocationState } from "../types";

export function useWeightManagement() {
  const [selectedIndicators, setSelectedIndicators] = useState<Set<string>>(new Set());
  const [weights, setWeights] = useState<Record<string, IndicatorAllocation>>({});
  const [previousWeights, setPreviousWeights] = useState<Record<string, IndicatorAllocation> | null>(null);
  const [error, setError] = useState("");
  const [showWeightWarning, setShowWeightWarning] = useState(false);
  const userMadeChangesRef = useRef(false);

  const handleToggleIndicator = useCallback((indicatorId: string) => {
    userMadeChangesRef.current = true;

    setSelectedIndicators((prev) => {
      const newSelected = new Set(prev);
      if (newSelected.has(indicatorId)) {
        newSelected.delete(indicatorId);
      } else {
        newSelected.add(indicatorId);
      }
      return newSelected;
    });

    setWeights((prev) => {
      const newWeights = cloneAllocationState(prev);
      if (newWeights[indicatorId]) {
        delete newWeights[indicatorId];
      } else {
        newWeights[indicatorId] = createEmptyAllocation();
      }
      return newWeights;
    });

    setError("");
    setShowWeightWarning(false);
  }, []);

  const handleWeightChange = useCallback((indicatorId: string, value: number) => {
    userMadeChangesRef.current = true;

    const clampedValue = Math.min(100, Math.max(0, value));
    // Redondear a 1 decimal para permitir valores como 33.3, 25.5, etc.
    const roundedValue = Math.round(clampedValue * 10) / 10;

    setWeights((prev) => {
      const othersTotal = Object.entries(prev).reduce(
        (sum, [id, allocation]) => {
          if (id === indicatorId) {
            return sum;
          }
          return sum + (allocation?.weight ?? 0);
        },
        0
      );
      const maxAllowed = Math.max(0, 100 - othersTotal);

      if (roundedValue <= maxAllowed) {
        const current = prev[indicatorId] ?? createEmptyAllocation();
        return {
          ...prev,
          [indicatorId]: {
            ...current,
            weight: roundedValue,
          },
        };
      }
      return prev;
    });

    setError("");
    setShowWeightWarning(false);
  }, []);

  const handleThresholdChange = useCallback(
    (indicatorId: string, value: string) => {
      userMadeChangesRef.current = true;

      setWeights((prev) => {
        const current = prev[indicatorId] ?? createEmptyAllocation();

        const updatedAllocation: IndicatorAllocation = {
          ...current,
          threshold: value === "" ? null : value,
        };

        // No validation - accept any text value including spaces

        return {
          ...prev,
          [indicatorId]: updatedAllocation,
        };
      });
    },
    [error]
  );

  const handleAutoDistribute = useCallback(() => {
    userMadeChangesRef.current = true;

    setWeights((prev) => {
      const selected = Array.from(selectedIndicators);
      if (selected.length === 0) return prev;

      setPreviousWeights(cloneAllocationState(prev));

      // Calcular distribución equitativa con 1 decimal de precisión
      const baseWeight = Math.floor((100 / selected.length) * 10) / 10;
      const totalAssigned = baseWeight * selected.length;
      const remainder = Math.round((100 - totalAssigned) * 10) / 10;

      const newWeights: Record<string, IndicatorAllocation> = {};
      selected.forEach((id, index) => {
        const existing = prev[id] ?? createEmptyAllocation();
        // Distribuir el resto entre los primeros indicadores con incrementos de 0.1
        const extra = index === 0 ? remainder : 0;
        newWeights[id] = {
          ...existing,
          weight: Math.round((baseWeight + extra) * 10) / 10,
        };
      });

      return newWeights;
    });

    setError("");
    setShowWeightWarning(false);
  }, [selectedIndicators]);

  const handleUndo = useCallback(() => {
    if (previousWeights) {
      setWeights(cloneAllocationState(previousWeights));
      setPreviousWeights(null);
      setError("");
      setShowWeightWarning(false);
    }
  }, [previousWeights]);

  const totalWeight = Object.values(weights).reduce(
    (sum, allocation) => sum + (allocation?.weight ?? 0),
    0
  );

  const indicatorsWithZeroWeight = Array.from(selectedIndicators).filter(
    (indicatorId) => (weights[indicatorId]?.weight ?? 0) === 0
  );
  const hasIndicatorsWithoutWeight = indicatorsWithZeroWeight.length > 0;

  // Check for missing thresholds - all selected indicators must have a threshold
  const indicatorsWithoutThreshold = Array.from(selectedIndicators).filter(
    (indicatorId) => {
      const threshold = weights[indicatorId]?.threshold;
      return !threshold || threshold.trim() === '';
    }
  );
  const hasInvalidThresholds = indicatorsWithoutThreshold.length > 0;

  const isValid =
    Math.abs(totalWeight - 100) < 0.1 &&
    selectedIndicators.size > 0 &&
    !hasIndicatorsWithoutWeight &&
    !hasInvalidThresholds;

  return {
    selectedIndicators,
    setSelectedIndicators,
    weights,
    setWeights,
    previousWeights,
    error,
    setError,
    showWeightWarning,
    setShowWeightWarning,
    userMadeChangesRef,
    handleToggleIndicator,
    handleWeightChange,
    handleThresholdChange,
    handleAutoDistribute,
    handleUndo,
    totalWeight,
    indicatorsWithZeroWeight,
    hasIndicatorsWithoutWeight,
    indicatorsWithoutThreshold,
    hasInvalidThresholds,
    isValid,
  };
}
