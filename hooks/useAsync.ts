"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export type UseAsyncOptions = {
  immediate?: boolean;
  refreshKey?: string | number | boolean | null;
};

export type UseAsyncSecondArgument =
  | string
  | number
  | boolean
  | null
  | UseAsyncOptions;

export type UseAsyncResult<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: () => Promise<T | null>;
  refresh: () => Promise<T | null>;
  reset: () => void;
};

function normalizeError(
  error: unknown
): Error {
  if (error instanceof Error) {
    return error;
  }

  if (typeof error === "string") {
    return new Error(error);
  }

  return new Error(
    "An unexpected error occurred."
  );
}

function resolveOptions(
  secondArgument?: UseAsyncSecondArgument
): Required<UseAsyncOptions> {
  if (typeof secondArgument === "object" && secondArgument !== null) {
    return {
      immediate: secondArgument.immediate ?? true,
      refreshKey: secondArgument.refreshKey ?? null,
    };
  }

  return { immediate: true, refreshKey: secondArgument ?? null };
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  secondArgument?: UseAsyncSecondArgument
): UseAsyncResult<T> {
  const options =
    resolveOptions(secondArgument);

  const asyncFunctionRef =
    useRef(asyncFunction);

  const mountedRef =
    useRef(true);

  const requestIdRef =
    useRef(0);

  const [data, setData] =
    useState<T | null>(null);

  const [loading, setLoading] =
    useState(options.immediate);

  const [error, setError] =
    useState<Error | null>(null);

  useEffect(() => {
    asyncFunctionRef.current =
      asyncFunction;
  }, [asyncFunction]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute =
    useCallback(async () => {
      const requestId =
        requestIdRef.current + 1;

      requestIdRef.current =
        requestId;

      if (mountedRef.current) {
        setLoading(true);
        setError(null);
      }

      try {
        const result =
          await asyncFunctionRef.current();

        if (
          mountedRef.current &&
          requestId ===
            requestIdRef.current
        ) {
          setData(result);
        }

        return result;
      } catch (caughtError) {
        const normalizedError =
          normalizeError(caughtError);

        if (
          mountedRef.current &&
          requestId ===
            requestIdRef.current
        ) {
          setError(normalizedError);
        }

        return null;
      } finally {
        if (
          mountedRef.current &&
          requestId ===
            requestIdRef.current
        ) {
          setLoading(false);
        }
      }
    }, []);

  const reset =
    useCallback(() => {
      requestIdRef.current += 1;

      setData(null);
      setError(null);
      setLoading(false);
    }, []);

  useEffect(() => {
    if (!options.immediate) {
      return;
    }

    void execute();

  }, [execute, options.immediate, options.refreshKey]);

  return {
    data,
    loading,
    error,
    execute,
    refresh: execute,
    reset,
  };
}