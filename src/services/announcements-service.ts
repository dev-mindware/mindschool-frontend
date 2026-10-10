import api from "./api";
import { fetchAllPages } from "./api-pagination";

export type AnnouncementStatus = "rascunho" | "publicado" | "arquivado";
export type AnnouncementAudience = "escola" | "turma";

export interface ApiAnnouncement {
  id: string;
  title: string;
  body: string;
  audience: AnnouncementAudience;
  section_id: string | null;
  status: AnnouncementStatus;
  created_by: string;
  created_at: string;
  published_at: string | null;
}

export interface NewAnnouncement { title: string; body: string; audience: AnnouncementAudience; sectionId?: string }

export const announcementsService = {
  list: () => fetchAllPages<ApiAnnouncement>("/s/announcements"),
  create: async (v: NewAnnouncement) =>
    (await api.post<ApiAnnouncement>("/s/announcements", { title: v.title, body: v.body, audience: v.audience, ...(v.audience === "turma" ? { section_id: v.sectionId } : {}) })).data,
  update: async (id: string, v: { title: string; body: string }) => (await api.patch<ApiAnnouncement>(`/s/announcements/${id}`, v)).data,
  publish: async (id: string) => (await api.post<ApiAnnouncement>(`/s/announcements/${id}/publish`, {})).data,
  archive: async (id: string) => (await api.post<ApiAnnouncement>(`/s/announcements/${id}/archive`, {})).data,
};
