import api from "./api";
import { SchoolVehicle, StudentTransportAssignment } from "@/types";

export interface TransportRouteItem {
  id: string;
  name: string;
  code: string;
  vehicleId: string;
  vehiclePlate: string;
  vehicleModel: string;
  driverName: string;
  driverPhone: string;
  monitorName: string;
  monitorPhone: string;
  shift: string;
  monthlyFee: number;
  assignedStudentsCount: number;
  capacity: number;
  stopsCount: number;
}

export const transportService = {
  getRoutes: async (): Promise<TransportRouteItem[]> => {
    const response = await api.get<TransportRouteItem[]>("/academic/transport/routes");
    return response.data;
  },

  getVehicles: async (): Promise<SchoolVehicle[]> => {
    const response = await api.get<SchoolVehicle[]>("/academic/transport/vehicles");
    return response.data;
  },

  getStudentAssignments: async (routeId?: string): Promise<StudentTransportAssignment[]> => {
    const response = await api.get<StudentTransportAssignment[]>("/academic/transport/assignments", {
      params: { routeId },
    });
    return response.data;
  },

  assignStudent: async (
    data: Partial<StudentTransportAssignment>
  ): Promise<StudentTransportAssignment> => {
    const response = await api.post<StudentTransportAssignment>(
      "/academic/transport/assignments",
      data
    );
    return response.data;
  },
};
