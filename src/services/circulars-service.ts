import api from "./api";
import { SchoolCircular, CircularRsvpItem } from "@/types";

export const circularsService = {
  getCirculars: async (params?: { audience?: string; type?: string }): Promise<SchoolCircular[]> => {
    const response = await api.get<SchoolCircular[]>("/communication/circulars", { params });
    return response.data;
  },

  getCircularById: async (id: string): Promise<SchoolCircular> => {
    const response = await api.get<SchoolCircular>(`/communication/circulars/${id}`);
    return response.data;
  },

  createCircular: async (data: Partial<SchoolCircular>): Promise<SchoolCircular> => {
    const response = await api.post<SchoolCircular>("/communication/circulars", data);
    return response.data;
  },

  deleteCircular: async (id: string): Promise<void> => {
    await api.delete(`/communication/circulars/${id}`);
  },

  recordRsvp: async (
    circularId: string,
    rsvp: Partial<CircularRsvpItem>
  ): Promise<SchoolCircular> => {
    const response = await api.post<SchoolCircular>(
      `/communication/circulars/${circularId}/rsvp`,
      rsvp
    );
    return response.data;
  },
};
