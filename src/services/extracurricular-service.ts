import api from "./api";
import { ExtracurricularActivity, ActivityEnrollment } from "@/types";

export const extracurricularService = {
  getActivities: async (): Promise<ExtracurricularActivity[]> => {
    const response = await api.get<ExtracurricularActivity[]>("/academic/extracurricular/activities");
    return response.data;
  },

  createActivity: async (data: Partial<ExtracurricularActivity>): Promise<ExtracurricularActivity> => {
    const response = await api.post<ExtracurricularActivity>("/academic/extracurricular/activities", data);
    return response.data;
  },

  getEnrollments: async (activityId?: string): Promise<ActivityEnrollment[]> => {
    const response = await api.get<ActivityEnrollment[]>("/academic/extracurricular/enrollments", {
      params: { activityId },
    });
    return response.data;
  },

  enrollStudent: async (data: Partial<ActivityEnrollment>): Promise<ActivityEnrollment> => {
    const response = await api.post<ActivityEnrollment>("/academic/extracurricular/enrollments", data);
    return response.data;
  },
};
