export type VehicleStatus = "ACTIVE" | "MAINTENANCE" | "INACTIVE";

export type RouteShift = "MORNING" | "AFTERNOON" | "BOTH";

export type BoardingStatus =
  | "PENDING"
  | "BOARDED"
  | "DROPPED_OFF"
  | "ABSENT_NOTIFIED"
  | "NO_SHOW";

export interface SchoolVehicle {
  id: string;
  plateNumber: string; // ex: "LD-45-88-HA"
  model: string; // ex: "Toyota Coaster (30 Lugares)"
  capacity: number; // total passenger seats
  driverName: string;
  driverPhone: string;
  monitorName: string;
  monitorPhone: string;
  status: VehicleStatus;
  insuranceExpiryDate: string;
  inspectionExpiryDate: string;
  notes?: string;
}

export interface TransportStop {
  id: string;
  name: string; // ex: "Paragem do Kero Kilamba"
  order: number;
  estimatedPickupTime: string; // ex: "06:30"
  estimatedDropoffTime: string; // ex: "13:45"
  landmark?: string; // ex: "Junto à bomba Sonangol"
}

export interface StudentTransportAssignment {
  id: string;
  studentId: string;
  studentNumber: string;
  studentName: string;
  classLevel: string;
  sectionName: string;
  routeId: string;
  stopId: string;
  stopName: string;
  shift: RouteShift;
  guardianName: string;
  guardianPhone: string;
  assignedAt: string;
  isActive: boolean;
}

export interface TransportRoute {
  id: string;
  code: string; // ex: "ROTA-01"
  name: string; // ex: "Kilamba - Camama - Talatona"
  shift: RouteShift;
  vehicleId: string;
  vehiclePlate: string;
  driverName: string;
  driverPhone: string;
  monitorName: string;
  monitorPhone: string;
  stops: TransportStop[];
  maxCapacity: number;
  assignedStudentsCount: number;
  isActive: boolean;
}

export interface DailyBoardingRecord {
  id: string;
  date: string; // YYYY-MM-DD
  routeId: string;
  routeName: string;
  shift: "MORNING" | "AFTERNOON";
  studentId: string;
  studentName: string;
  studentNumber: string;
  stopName: string;
  status: BoardingStatus;
  checkedAt?: string;
  checkedBy?: string; // Monitor(a)
  guardianNotified: boolean;
  notes?: string;
}
