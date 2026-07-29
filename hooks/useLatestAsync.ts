"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type UseLatestAsyncOptions<T> = {
  fetchData: () => Promise<T>;
  onSuccess: (result: T) => void;
  onError: (error: unknown) => void;
  refreshKey?: string | number | boolean | null;
};

export function useLatestAsync<T>({
  fetchData,
  onSuccess,
  onError,
  refreshKey = null,
}: UseLatestAsyncOptions<T>) {
  const callbacksRef = useRef({ fetchData, onSuccess, onError, refreshKey });
  const requestIdRef = useRef(0);
  const mountedRef = useRef(true);
  const [settledKey, setSettledKey] = useState<{ value: typeof refreshKey } | null>(null);
  const [manualPendingKey, setManualPendingKey] =
    useState<{ value: typeof refreshKey } | null>(null);

  useEffect(() => {
    callbacksRef.current = { fetchData, onSuccess, onError, refreshKey };
  }, [fetchData, onSuccess, onError, refreshKey]);

  useEffect(() => {
    mountedRef.current = true;
    const requestId = ++requestIdRef.current;
    let active = true;

    fetchData()
      .then((result) => {
        if (active && requestId === requestIdRef.current) {
          onSuccess(result);
        }
      })
      .catch((error: unknown) => {
        if (active && requestId === requestIdRef.current) {
          onError(error);
        }
      })
      .finally(() => {
        if (active && requestId === requestIdRef.current) {
          setSettledKey({ value: refreshKey });
        }
      });

    return () => {
      active = false;
      mountedRef.current = false;
      requestIdRef.current += 1;
    };
  }, [fetchData, onError, onSuccess, refreshKey]);

  const refresh = useCallback(async (): Promise<T | null> => {
    const requestId = ++requestIdRef.current;
    const requestKey = callbacksRef.current.refreshKey;
    setManualPendingKey({ value: requestKey });

    try {
      const result = await callbacksRef.current.fetchData();
      if (mountedRef.current && requestId === requestIdRef.current) {
        callbacksRef.current.onSuccess(result);
      }
      return result;
    } catch (error) {
      if (mountedRef.current && requestId === requestIdRef.current) {
        callbacksRef.current.onError(error);
      }
      return null;
    } finally {
      if (mountedRef.current && requestId === requestIdRef.current) {
        setSettledKey({ value: requestKey });
        setManualPendingKey(null);
      }
    }
  }, []);

  const loading =
    (manualPendingKey !== null &&
      Object.is(manualPendingKey.value, refreshKey)) ||
    settledKey === null ||
    !Object.is(settledKey.value, refreshKey);

  return { loading, refresh };
}
