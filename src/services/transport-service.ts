import api from "./api";
import { fetchAllPages } from "./api-pagination";

export interface ApiStop { id: string; route_id: string; name: string; order_index: number; pickup_time: string | null }

export interface ApiRoute {
  id: string;
  name: string;
  vehicle_plate: string | null;
  driver_name: string | null;
  driver_phone: string | null;
  capacity: number;
  occupied: number;
  seats_free: number;
  is_active: boolean;
  stops: ApiStop[];
}

export interface ApiTransportAssignment {
  id: string;
  student_id: string;
  route_id: string;
  stop_id: string;
  valid_from: string;
  valid_to: string | null;
  active: boolean;
}

export interface NewRoute {
  name: string;
  vehiclePlate?: string;
  driverName?: string;
  driverPhone?: string;
  capacity: number;
  stops: Array<{ name: string; pickupTime?: string }>;
}

export const transportService = {
  routes: async (): Promise<ApiRoute[]> => (await api.get<{ data: ApiRoute[] }>("/s/transport/routes")).data.data,
  assignments: () => fetchAllPages<ApiTransportAssignment>("/s/transport/assignments", { active: "true" }),

  /** Cria a rota e as paragens, pela ordem indicada. */
  createRoute: async (v: NewRoute): Promise<ApiRoute> => {
    const { data } = await api.post<ApiRoute>("/s/transport/routes", {
      name: v.name, capacity: v.capacity,
      ...(v.vehiclePlate ? { vehicle_plate: v.vehiclePlate } : {}), ...(v.driverName ? { driver_name: v.driverName } : {}), ...(v.driverPhone ? { driver_phone: v.driverPhone } : {}),
    });
    for (const s of v.stops) await api.post(`/s/transport/routes/${data.id}/stops`, { name: s.name, ...(s.pickupTime ? { pickup_time: s.pickupTime } : {}) });
    return data;
  },
  addStop: async (routeId: string, name: string, pickupTime?: string) =>
    (await api.post<ApiStop>(`/s/transport/routes/${routeId}/stops`, { name, ...(pickupTime ? { pickup_time: pickupTime } : {}) })).data,
  setActive: async (id: string, isActive: boolean) => (await api.patch<ApiRoute>(`/s/transport/routes/${id}`, { is_active: isActive })).data,
  assign: async (v: { studentId: string; routeId: string; stopId: string }) =>
    (await api.post<ApiTransportAssignment>("/s/transport/assignments", { student_id: v.studentId, route_id: v.routeId, stop_id: v.stopId })).data,
  endAssignment: async (id: string) => (await api.post<ApiTransportAssignment>(`/s/transport/assignments/${id}/end`, {})).data,
};
