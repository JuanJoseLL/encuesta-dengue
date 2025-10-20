import { useState, useRef, useCallback } from "react";
import type { IndicatorAllocation } from "../types";
import { createEmptyAllocation, cloneAllocationState, THRESHOLD_ERROR_MESSAGE } from "../types";

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
    const roundedValue = Math.round(clampedValue / 5) * 5;

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
    (indicatorId: string, rawValue: string) => {
      userMadeChangesRef.current = true;

      const trimmedValue = rawValue.trim();
      const parsedValue = trimmedValue === "" ? null : Number.parseFloat(trimmedValue);

      setWeights((prev) => {
        const current = prev[indicatorId] ?? createEmptyAllocation();
        
        // Always allow updating the raw value for better UX while typing
        const updatedAllocation: IndicatorAllocation = {
          ...current,
          thresholdRaw: rawValue,
          threshold: (trimmedValue === "" || !Number.isFinite(parsedValue)) ? null : parsedValue,
        };

        // Validate only if we have a valid number
        const isInvalidThreshold = updatedAllocation.threshold !== null && updatedAllocation.threshold <= 0;

        if (isInvalidThreshold) {
          setError(THRESHOLD_ERROR_MESSAGE);
        } else if (error === THRESHOLD_ERROR_MESSAGE) {
          setError("");
        }

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

      const perItemBase = Math.floor(100 / selected.length / 5) * 5;
      const remainder = 100 - perItemBase * selected.length;
      const increments = Math.max(0, Math.floor(remainder / 5));

      const newWeights: Record<string, IndicatorAllocation> = {};
      selected.forEach((id, index) => {
        const extra = index < increments ? 5 : 0;
        const existing = prev[id] ?? createEmptyAllocation();
        newWeights[id] = {
          ...existing,
          weight: perItemBase + extra,
        };
      });

      const assignedTotal = Object.values(newWeights).reduce(
        (sum, allocation) => sum + (allocation.weight ?? 0),
        0
      );
      let difference = 100 - assignedTotal;
      if (difference !== 0) {
        const step = difference > 0 ? 5 : -5;
        const ordered = [...selected];
        let idx = 0;
        while (difference !== 0 && ordered.length > 0) {
          const indicatorId = ordered[idx % ordered.length];
          const nextValue = (newWeights[indicatorId]?.weight ?? 0) + step;
          if (nextValue >= 0 && nextValue <= 100) {
            newWeights[indicatorId] = {
              ...newWeights[indicatorId],
              weight: nextValue,
            };
            difference -= step;
          } else {
            ordered.splice(idx % ordered.length, 1);
            continue;
          }
          idx += 1;
        }
      }

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

  const hasInvalidThresholds = Array.from(selectedIndicators).some(
    (indicatorId) => {
      const allocation = weights[indicatorId];
      if (!allocation) {
        return false;
      }
      const { threshold } = allocation;
      return threshold != null && threshold <= 0;
    }
  );

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
    hasInvalidThresholds,
    isValid,
  };
}
