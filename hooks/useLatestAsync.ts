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
  const callbacksRef = useRef({ fetchData, onSuccess, onError });
  const requestIdRef = useRef(0);
  const mountedRef = useRef(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    callbacksRef.current = { fetchData, onSuccess, onError };
  }, [fetchData, onSuccess, onError]);

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
          setLoading(false);
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
    setLoading(true);

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
        setLoading(false);
      }
    }
  }, []);

  return { loading, refresh };
}
