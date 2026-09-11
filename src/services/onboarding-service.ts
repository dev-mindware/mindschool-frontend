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

export const onboardingService = {
  async getPreferences() {
    const response = await api.get<
      OnboardingPreferencesResponse | { data: OnboardingPreferencesResponse }
    >("/onboarding");
    return unwrapResponse(response.data);
  },

  async updatePreferences(payload: UpdateOnboardingPreferencesPayload) {
    const response = await api.patch<
      OnboardingPreferencesResponse["preferences"]
    >("/onboarding/preferences", payload);
    return response.data;
  },

  async updateTour(
    tourId: OnboardingTourId,
    payload: UpdateOnboardingTourPayload,
  ) {
    const response = await api.put<OnboardingTourProgress>(
      `/onboarding/tours/${tourId}`,
      payload,
    );
    return response.data;
  },

  async resetTour(tourId: OnboardingTourId) {
    await api.delete(`/onboarding/tours/${tourId}`);
  },

  async resetAllTours() {
    await api.delete("/onboarding/tours");
  },
};
