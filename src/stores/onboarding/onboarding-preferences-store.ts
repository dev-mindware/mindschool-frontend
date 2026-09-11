import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { OnboardingTourId } from "@/constants/onboarding-tours";

export type OnboardingTourSeenStatus = "completed" | "skipped";

export type OnboardingScopePreferences = {
  autoStartEnabled: boolean;
  tourButtonEnabled: boolean;
  seenTours: Partial<Record<OnboardingTourId, OnboardingTourSeenStatus>>;
};

type OnboardingPreferencesState = {
  preferencesByScope: Record<string, OnboardingScopePreferences>;
  getPreferences: (scope: string) => OnboardingScopePreferences;
  hydratePreferences: (
    scope: string,
    preferences: Partial<OnboardingScopePreferences>,
  ) => void;
  setAutoStartEnabled: (scope: string, enabled: boolean) => void;
  setTourButtonEnabled: (scope: string, enabled: boolean) => void;
  markTourCompleted: (scope: string, tourId: OnboardingTourId) => void;
  markTourSkipped: (scope: string, tourId: OnboardingTourId) => void;
  resetTour: (scope: string, tourId: OnboardingTourId) => void;
  resetAllTours: (scope: string) => void;
};

const defaultPreferences: OnboardingScopePreferences = {
  autoStartEnabled: true,
  tourButtonEnabled: true,
  seenTours: {},
};

function mergeWithDefaults(
  preferences?: Partial<OnboardingScopePreferences>,
): OnboardingScopePreferences {
  return {
    autoStartEnabled:
      preferences?.autoStartEnabled ?? defaultPreferences.autoStartEnabled,
    tourButtonEnabled:
      preferences?.tourButtonEnabled ?? defaultPreferences.tourButtonEnabled,
    seenTours: preferences?.seenTours ?? {},
  };
}

export const useOnboardingPreferencesStore =
  create<OnboardingPreferencesState>()(
    persist(
      (set, get) => ({
        preferencesByScope: {},
        getPreferences: (scope) =>
          mergeWithDefaults(get().preferencesByScope[scope]),
        hydratePreferences: (scope, preferences) =>
          set((state) => ({
            preferencesByScope: {
              ...state.preferencesByScope,
              [scope]: mergeWithDefaults(preferences),
            },
          })),
        setAutoStartEnabled: (scope, enabled) =>
          set((state) => ({
            preferencesByScope: {
              ...state.preferencesByScope,
              [scope]: {
                ...mergeWithDefaults(state.preferencesByScope[scope]),
                autoStartEnabled: enabled,
              },
            },
          })),
        setTourButtonEnabled: (scope, enabled) =>
          set((state) => ({
            preferencesByScope: {
              ...state.preferencesByScope,
              [scope]: {
                ...mergeWithDefaults(state.preferencesByScope[scope]),
                tourButtonEnabled: enabled,
              },
            },
          })),
        markTourCompleted: (scope, tourId) =>
          set((state) => {
            const current = mergeWithDefaults(state.preferencesByScope[scope]);

            return {
              preferencesByScope: {
                ...state.preferencesByScope,
                [scope]: {
                  ...current,
                  seenTours: {
                    ...current.seenTours,
                    [tourId]: "completed",
                  },
                },
              },
            };
          }),
        markTourSkipped: (scope, tourId) =>
          set((state) => {
            const current = mergeWithDefaults(state.preferencesByScope[scope]);

            return {
              preferencesByScope: {
                ...state.preferencesByScope,
                [scope]: {
                  ...current,
                  seenTours: {
                    ...current.seenTours,
                    [tourId]: "skipped",
                  },
                },
              },
            };
          }),
        resetTour: (scope, tourId) =>
          set((state) => {
            const current = mergeWithDefaults(state.preferencesByScope[scope]);
            const nextSeenTours = { ...current.seenTours };
            delete nextSeenTours[tourId];

            return {
              preferencesByScope: {
                ...state.preferencesByScope,
                [scope]: {
                  ...current,
                  seenTours: nextSeenTours,
                },
              },
            };
          }),
        resetAllTours: (scope) =>
          set((state) => ({
            preferencesByScope: {
              ...state.preferencesByScope,
              [scope]: {
                ...mergeWithDefaults(state.preferencesByScope[scope]),
                seenTours: {},
              },
            },
          })),
      }),
      {
        name: "mindgest-onboarding-preferences",
        version: 1,
      },
    ),
  );
