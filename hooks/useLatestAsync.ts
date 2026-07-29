"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type RefreshKey =
  | string
  | number
  | boolean
  | null;

type UseLatestAsyncOptions<T> = {
  fetchData: () => Promise<T>;
  onSuccess: (result: T) => void;
  onError: (error: unknown) => void;
  refreshKey?: RefreshKey;
};

type ManualPendingRequest = {
  requestId: number;
  refreshKey: RefreshKey;
};

export function useLatestAsync<T>({
  fetchData,
  onSuccess,
  onError,
  refreshKey = null,
}: UseLatestAsyncOptions<T>) {
  const callbacksRef = useRef({
    fetchData,
    onSuccess,
    onError,
    refreshKey,
  });

  const requestIdRef = useRef(0);
  const mountedRef = useRef(true);

  const [settledKey, setSettledKey] =
    useState<{
      value: RefreshKey;
    } | null>(null);

  const [
    manualPendingRequest,
    setManualPendingRequest,
  ] =
    useState<ManualPendingRequest | null>(
      null
    );

  useEffect(() => {
    callbacksRef.current = {
      fetchData,
      onSuccess,
      onError,
      refreshKey,
    };
  }, [
    fetchData,
    onSuccess,
    onError,
    refreshKey,
  ]);

  useEffect(() => {
    mountedRef.current = true;

    const requestId =
      ++requestIdRef.current;

    let active = true;

    fetchData()
      .then((result) => {
        if (
          active &&
          requestId ===
            requestIdRef.current
        ) {
          onSuccess(result);
        }
      })
      .catch((error: unknown) => {
        if (
          active &&
          requestId ===
            requestIdRef.current
        ) {
          onError(error);
        }
      })
      .finally(() => {
        if (
          active &&
          requestId ===
            requestIdRef.current
        ) {
          setSettledKey({
            value: refreshKey,
          });

          setManualPendingRequest(
            (pendingRequest) => {
              if (
                pendingRequest &&
                pendingRequest.requestId <
                  requestId
              ) {
                return null;
              }

              return pendingRequest;
            }
          );
        }
      });

    return () => {
      active = false;
      mountedRef.current = false;
      requestIdRef.current += 1;
    };
  }, [
    fetchData,
    onError,
    onSuccess,
    refreshKey,
  ]);

  const refresh = useCallback(
    async (): Promise<T | null> => {
      const requestId =
        ++requestIdRef.current;

      const requestKey =
        callbacksRef.current.refreshKey;

      setManualPendingRequest({
        requestId,
        refreshKey: requestKey,
      });

      try {
        const result =
          await callbacksRef.current.fetchData();

        if (
          mountedRef.current &&
          requestId ===
            requestIdRef.current
        ) {
          callbacksRef.current.onSuccess(
            result
          );
        }

        return result;
      } catch (error) {
        if (
          mountedRef.current &&
          requestId ===
            requestIdRef.current
        ) {
          callbacksRef.current.onError(
            error
          );
        }

        return null;
      } finally {
        if (
          mountedRef.current &&
          requestId ===
            requestIdRef.current
        ) {
          setSettledKey({
            value: requestKey,
          });

          setManualPendingRequest(null);
        }
      }
    },
    []
  );

  const manualRequestIsPending =
    manualPendingRequest !== null &&
    Object.is(
      manualPendingRequest.refreshKey,
      refreshKey
    );

  const loading =
    manualRequestIsPending ||
    settledKey === null ||
    !Object.is(
      settledKey.value,
      refreshKey
    );

  return {
    loading,
    refresh,
  };
}