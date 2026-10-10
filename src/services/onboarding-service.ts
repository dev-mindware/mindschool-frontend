import type {
  OnboardingTourId,
  OnboardingTourMode,
} from "@/constants/onboarding-tours";
import type { OnboardingTourSeenStatus } from "@/stores/onboarding";
import { api } from "./api";

export type OnboardingTourStatus =
  | "in_progress"
  | OnboardingTourSeenStatus;

export type OnboardingTourProgress = {
  status: OnboardingTourStatus;
  mode?: OnboardingTourMode;
  lastStepIndex?: number;
  tourVersion?: number;
  startedAt?: string;
  completedAt?: string;
  skippedAt?: string;
  updatedAt?: string;
};

export type OnboardingPreferencesResponse = {
  preferences: {
    autoStartEnabled: boolean;
    tourButtonEnabled: boolean;
  };
  tours: Partial<Record<OnboardingTourId, OnboardingTourProgress>>;
  updatedAt?: string;
};

export type UpdateOnboardingPreferencesPayload = Partial<
  OnboardingPreferencesResponse["preferences"]
>;

export type UpdateOnboardingTourPayload = {
  status: OnboardingTourStatus;
  mode: OnboardingTourMode;
  lastStepIndex?: number;
  tourVersion: number;
};

function unwrapResponse(
  response: OnboardingPreferencesResponse | { data: OnboardingPreferencesResponse },
) {
  return "data" in response ? response.data : response;
}

/**
 * A API do MindSchool não tem (ainda) endpoints de onboarding: o progresso dos tours vive no armazenamento local
 * (`useOnboardingPreferencesStore`, persistido). Só com `NEXT_PUBLIC_ONBOARDING_REMOTE=true` se fala com a API.
 */
const REMOTE = process.env.NEXT_PUBLIC_ONBOARDING_REMOTE === "true";
const LOCAL_DEFAULTS: OnboardingPreferencesResponse = { preferences: { autoStartEnabled: true, tourButtonEnabled: true }, tours: {} };

export const onboardingService = {
  async getPreferences() {
    if (!REMOTE) return LOCAL_DEFAULTS;
    const response = await api.get<
      OnboardingPreferencesResponse | { data: OnboardingPreferencesResponse }
    >("/onboarding");
    return unwrapResponse(response.data);
  },

  async updatePreferences(payload: UpdateOnboardingPreferencesPayload) {
    if (!REMOTE) return { ...LOCAL_DEFAULTS.preferences, ...payload };
    const response = await api.patch<
      OnboardingPreferencesResponse["preferences"]
    >("/onboarding/preferences", payload);
    return response.data;
  },

  async updateTour(
    tourId: OnboardingTourId,
    payload: UpdateOnboardingTourPayload,
  ) {
    if (!REMOTE) return { ...payload, updatedAt: new Date().toISOString() } as OnboardingTourProgress;
    const response = await api.put<OnboardingTourProgress>(
      `/onboarding/tours/${tourId}`,
      payload,
    );
    return response.data;
  },

  async resetTour(tourId: OnboardingTourId) {
    if (!REMOTE) return;
    await api.delete(`/onboarding/tours/${tourId}`);
  },

  async resetAllTours() {
    if (!REMOTE) return;
    await api.delete("/onboarding/tours");
  },
};
