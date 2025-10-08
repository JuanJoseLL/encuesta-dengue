import { useCallback, useEffect, useRef } from "react";

interface UseAutosaveOptions<TPayload> {
  delay?: number;
  onSave: (payload: TPayload) => Promise<void> | void;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export function useAutosave<TPayload>({
  delay = 800,
  onSave,
  onSuccess,
  onError,
}: UseAutosaveOptions<TPayload>) {
  const isSavingRef = useRef(false);
  const lastPayloadRef = useRef<TPayload | null>(null);
  const mountedRef = useRef(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      mountedRef.current = false;
    };
  }, []);

  const autosave = useCallback(
    async (payload: TPayload) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(async () => {
        if (isSavingRef.current && lastPayloadRef.current === payload) {
          return;
        }

        isSavingRef.current = true;
        lastPayloadRef.current = payload;

        try {
          await onSave(payload);
          if (mountedRef.current) {
            onSuccess?.();
          }
        } catch (error) {
          if (mountedRef.current) {
            onError?.(error);
          }
        } finally {
          isSavingRef.current = false;
        }
      }, delay);
    },
    [delay, onSave, onSuccess, onError],
  );

  return autosave;
}
