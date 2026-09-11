"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  OnboardingTourId,
  OnboardingTourMode,
} from "@/constants/onboarding-tours";
import { onboardingTours } from "@/constants/onboarding-tours";
import {
  onboardingService,
  type OnboardingPreferencesResponse,
  type UpdateOnboardingPreferencesPayload,
  type UpdateOnboardingTourPayload,
} from "@/services/onboarding-service";
import { useOnboardingPreferencesStore } from "@/stores";

const ONBOARDING_QUERY_KEY = ["onboarding-preferences"] as const;
const PENDING_TOUR_UPDATES_KEY = "mindgest-pending-onboarding-tour-updates";
const PENDING_TOUR_RESETS_KEY = "mindgest-pending-onboarding-tour-resets";

type PendingTourUpdate = {
  scope: string;
  tourId: OnboardingTourId;
  payload: UpdateOnboardingTourPayload;
  updatedAt: string;
};

type PendingTourReset = {
  scope: string;
  tourId: OnboardingTourId;
  updatedAt: string;
};

function reportPersistenceError(error: unknown) {
  if (process.env.NODE_ENV !== "production") {
    console.warn("Não foi possível sincronizar os guias com a API.", error);
  }
}

function readPendingTourUpdates() {
  if (typeof window === "undefined") return [];

  try {
    const rawUpdates = window.localStorage.getItem(PENDING_TOUR_UPDATES_KEY);
    if (!rawUpdates) return [];

    const parsedUpdates = JSON.parse(rawUpdates);
    return Array.isArray(parsedUpdates)
      ? (parsedUpdates as PendingTourUpdate[])
      : [];
  } catch (error) {
    reportPersistenceError(error);
    return [];
  }
}

function writePendingTourUpdates(updates: PendingTourUpdate[]) {
  if (typeof window === "undefined") return;

  try {
    if (updates.length === 0) {
      window.localStorage.removeItem(PENDING_TOUR_UPDATES_KEY);
      return;
    }

    window.localStorage.setItem(
      PENDING_TOUR_UPDATES_KEY,
      JSON.stringify(updates),
    );
  } catch (error) {
    reportPersistenceError(error);
  }
}

function enqueuePendingTourUpdate(
  scope: string,
  tourId: OnboardingTourId,
  payload: UpdateOnboardingTourPayload,
) {
  const nextUpdates = readPendingTourUpdates().filter(
    (update) => update.scope !== scope || update.tourId !== tourId,
  );

  nextUpdates.push({
    scope,
    tourId,
    payload,
    updatedAt: new Date().toISOString(),
  });

  writePendingTourUpdates(nextUpdates);
}

function removePendingTourUpdate(scope: string, tourId: OnboardingTourId) {
  writePendingTourUpdates(
    readPendingTourUpdates().filter(
      (update) => update.scope !== scope || update.tourId !== tourId,
    ),
  );
}

function readPendingTourResets() {
  if (typeof window === "undefined") return [];

  try {
    const rawResets = window.localStorage.getItem(PENDING_TOUR_RESETS_KEY);
    if (!rawResets) return [];

    const parsedResets = JSON.parse(rawResets);
    return Array.isArray(parsedResets)
      ? (parsedResets as PendingTourReset[])
      : [];
  } catch (error) {
    reportPersistenceError(error);
    return [];
  }
}

function writePendingTourResets(resets: PendingTourReset[]) {
  if (typeof window === "undefined") return;

  try {
    if (resets.length === 0) {
      window.localStorage.removeItem(PENDING_TOUR_RESETS_KEY);
      return;
    }

    window.localStorage.setItem(PENDING_TOUR_RESETS_KEY, JSON.stringify(resets));
  } catch (error) {
    reportPersistenceError(error);
  }
}

function enqueuePendingTourReset(scope: string, tourId: OnboardingTourId) {
  removePendingTourUpdate(scope, tourId);

  const nextResets = readPendingTourResets().filter(
    (reset) => reset.scope !== scope || reset.tourId !== tourId,
  );

  nextResets.push({
    scope,
    tourId,
    updatedAt: new Date().toISOString(),
  });

  writePendingTourResets(nextResets);
}

function removePendingTourReset(scope: string, tourId: OnboardingTourId) {
  writePendingTourResets(
    readPendingTourResets().filter(
      (reset) => reset.scope !== scope || reset.tourId !== tourId,
    ),
  );
}

function removePendingScopeOperations(scope: string) {
  writePendingTourUpdates(
    readPendingTourUpdates().filter((update) => update.scope !== scope),
  );
  writePendingTourResets(
    readPendingTourResets().filter((reset) => reset.scope !== scope),
  );
}

export function useOnboardingPreferencesPersistence(
  scope: string,
  enabled = true,
) {
  const queryClient = useQueryClient();
  const queryKey = useMemo(
    () => [...ONBOARDING_QUERY_KEY, scope] as const,
    [scope],
  );
  const hydratePreferences = useOnboardingPreferencesStore(
    (state) => state.hydratePreferences,
  );
  const getPreferences = useOnboardingPreferencesStore(
    (state) => state.getPreferences,
  );
  const resetTourInStore = useOnboardingPreferencesStore(
    (state) => state.resetTour,
  );
  const resetAllToursInStore = useOnboardingPreferencesStore(
    (state) => state.resetAllTours,
  );

  const query = useQuery({
    queryKey,
    queryFn: onboardingService.getPreferences,
    enabled,
    retry: false,
    retryOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!query.data) return;

    const seenTours: Partial<
      Record<OnboardingTourId, "completed" | "skipped">
    > = {};

    for (const [tourId, progress] of Object.entries(query.data.tours)) {
      const id = tourId as OnboardingTourId;
      const currentTour = onboardingTours[id];
      if (!currentTour || !progress) continue;
      if (
        progress.tourVersion !== undefined &&
        progress.tourVersion < currentTour.version
      ) {
        continue;
      }
      if (progress.status === "completed" || progress.status === "skipped") {
        seenTours[id] = progress.status;
      }
    }

    const pendingResetTourIds = new Set(
      readPendingTourResets()
        .filter((reset) => reset.scope === scope)
        .map((reset) => reset.tourId),
    );
    const localSeenTours = Object.fromEntries(
      Object.entries(getPreferences(scope).seenTours).filter(
        ([tourId]) => !pendingResetTourIds.has(tourId as OnboardingTourId),
      ),
    ) as Partial<Record<OnboardingTourId, "completed" | "skipped">>;
    const pendingSeenTours = readPendingTourUpdates()
      .filter(
        (update) =>
          update.scope === scope &&
          !pendingResetTourIds.has(update.tourId) &&
          (update.payload.status === "completed" ||
            update.payload.status === "skipped"),
      )
      .reduce<Partial<Record<OnboardingTourId, "completed" | "skipped">>>(
        (acc, update) => ({
          ...acc,
          [update.tourId]:
            update.payload.status === "completed" ? "completed" : "skipped",
        }),
        {},
      );

    hydratePreferences(scope, {
      ...query.data.preferences,
      seenTours: {
        ...Object.fromEntries(
          Object.entries(seenTours).filter(
            ([tourId]) => !pendingResetTourIds.has(tourId as OnboardingTourId),
          ),
        ),
        ...localSeenTours,
        ...pendingSeenTours,
      },
    });
  }, [getPreferences, hydratePreferences, query.data, scope]);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    async function flushPendingTourUpdates() {
      const pendingResets = readPendingTourResets().filter(
        (reset) => reset.scope === scope,
      );
      const pendingUpdates = readPendingTourUpdates().filter(
        (update) => update.scope === scope,
      );

      if (pendingResets.length === 0 && pendingUpdates.length === 0) return;

      for (const reset of pendingResets) {
        if (cancelled) return;

        try {
          await onboardingService.resetTour(reset.tourId);
          removePendingTourReset(scope, reset.tourId);
        } catch (error) {
          reportPersistenceError(error);
          return;
        }
      }

      for (const update of pendingUpdates) {
        if (cancelled) return;

        try {
          await onboardingService.updateTour(update.tourId, update.payload);
          removePendingTourUpdate(scope, update.tourId);
        } catch (error) {
          reportPersistenceError(error);
          return;
        }
      }

      if (!cancelled) {
        queryClient.invalidateQueries({ queryKey });
      }
    }

    void flushPendingTourUpdates();

    return () => {
      cancelled = true;
    };
  }, [enabled, queryClient, queryKey, scope]);

  const { mutate: mutatePreferences } = useMutation({
    mutationFn: (payload: UpdateOnboardingPreferencesPayload) =>
      onboardingService.updatePreferences(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey,
      }),
    onError: reportPersistenceError,
  });

  const { mutateAsync: mutateTour } = useMutation({
    mutationFn: ({
      tourId,
      payload,
    }: {
      tourId: OnboardingTourId;
      payload: UpdateOnboardingTourPayload;
    }) => onboardingService.updateTour(tourId, payload),
    retry: 3,
    retryDelay: (failureCount) => Math.min(1000 * 2 ** failureCount, 8000),
    onMutate: async ({ tourId, payload }) => {
      await queryClient.cancelQueries({ queryKey });

      const previousPreferences =
        queryClient.getQueryData<OnboardingPreferencesResponse>(queryKey);

      queryClient.setQueryData<OnboardingPreferencesResponse>(
        queryKey,
        (current) => {
          if (!current) return current;

          return {
            ...current,
            tours: {
              ...(current.tours || {}),
              [tourId]: {
                ...(current.tours?.[tourId] || {}),
                ...payload,
                updatedAt: new Date().toISOString(),
              },
            },
          };
        },
      );

      return { previousPreferences };
    },
    onError: (error, variables) => {
      enqueuePendingTourUpdate(scope, variables.tourId, variables.payload);
      reportPersistenceError(error);
    },
    onSuccess: (_data, variables) => {
      removePendingTourUpdate(scope, variables.tourId);
    },
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey,
      }),
  });

  const { mutate: mutateResetTour } = useMutation({
    mutationFn: onboardingService.resetTour,
    retry: 3,
    retryDelay: (failureCount) => Math.min(1000 * 2 ** failureCount, 8000),
    onMutate: async (tourId) => {
      await queryClient.cancelQueries({ queryKey });
      enqueuePendingTourReset(scope, tourId);

      queryClient.setQueryData<OnboardingPreferencesResponse>(
        queryKey,
        (current) => {
          if (!current) return current;

          const nextTours = { ...(current.tours || {}) };
          delete nextTours[tourId];

          return {
            ...current,
            tours: nextTours,
          };
        },
      );
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey,
      }),
    onError: (error, tourId) => {
      enqueuePendingTourReset(scope, tourId);
      reportPersistenceError(error);
    },
    onSettled: (_data, _error, tourId) => {
      if (!_error) {
        removePendingTourReset(scope, tourId);
      }
    },
  });

  const { mutate: mutateResetAll } = useMutation({
    mutationFn: onboardingService.resetAllTours,
    onMutate: () => {
      removePendingScopeOperations(scope);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey,
      }),
    onError: reportPersistenceError,
  });

  const persistPreferences = useCallback(
    (payload: UpdateOnboardingPreferencesPayload) =>
      mutatePreferences(payload),
    [mutatePreferences],
  );
  const persistTour = useCallback(
    (
      tourId: OnboardingTourId,
      status: UpdateOnboardingTourPayload["status"],
      mode: OnboardingTourMode,
      tourVersion: number,
      lastStepIndex?: number,
    ) =>
      mutateTour({
        tourId,
        payload: { status, mode, tourVersion, lastStepIndex },
      }).catch(() => undefined),
    [mutateTour],
  );
  const persistResetTour = useCallback(
    (tourId: OnboardingTourId) => {
      resetTourInStore(scope, tourId);
      mutateResetTour(tourId);
    },
    [mutateResetTour, resetTourInStore, scope],
  );
  const persistResetAllTours = useCallback(
    () => {
      resetAllToursInStore(scope);
      mutateResetAll();
    },
    [mutateResetAll, resetAllToursInStore, scope],
  );

  return {
    isHydrating: query.isLoading,
    persistPreferences,
    persistTour,
    persistResetTour,
    persistResetAllTours,
  };
}
