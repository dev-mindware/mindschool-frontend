import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  SchoolVehicle,
  TransportRoute,
  StudentTransportAssignment,
  DailyBoardingRecord,
  BoardingStatus,
  RouteShift,
} from "@/types";

interface TransportState {
  vehicles: SchoolVehicle[];
  routes: TransportRoute[];
  assignments: StudentTransportAssignment[];
  boardingLogs: DailyBoardingRecord[];
  selectedRouteId: string;
  searchQuery: string;

  // Actions
  setSelectedRouteId: (id: string) => void;
  setSearchQuery: (q: string) => void;

  addVehicle: (vehicle: Omit<SchoolVehicle, "id">) => SchoolVehicle;
  updateVehicle: (id: string, data: Partial<SchoolVehicle>) => void;

  addRoute: (route: Omit<TransportRoute, "id" | "assignedStudentsCount">) => TransportRoute;
  updateRoute: (id: string, data: Partial<TransportRoute>) => void;

  assignStudentToRoute: (
    assignment: Omit<StudentTransportAssignment, "id" | "assignedAt" | "isActive">
  ) => StudentTransportAssignment;
  removeStudentFromRoute: (assignmentId: string) => void;

  updateBoardingStatus: (
    logId: string,
    status: BoardingStatus,
    checkedBy?: string,
    notes?: string
  ) => void;
}

const INITIAL_VEHICLES: SchoolVehicle[] = [
  {
    id: "veh-01",
    plateNumber: "LD-48-22-GA",
    model: "Toyota Coaster (30 Lugares)",
    capacity: 30,
    driverName: "Sr. Mateus Domingos Panzo",
    driverPhone: "+244 923 110 221",
    monitorName: "D. Madalena Sebastião",
    monitorPhone: "+244 912 334 556",
    status: "ACTIVE",
    insuranceExpiryDate: "2026-11-30",
    inspectionExpiryDate: "2026-10-15",
    notes: "Viatura com revisão preventiva e cintos de segurança em todos os bancos.",
  },
  {
    id: "veh-02",
    plateNumber: "LD-65-19-HY",
    model: "Toyota Hiace Commuter (15 Lugares)",
    capacity: 15,
    driverName: "Sr. João Manuel Kiala",
    driverPhone: "+244 931 445 667",
    monitorName: "D. Esperança Afonso",
    monitorPhone: "+244 945 778 990",
    status: "ACTIVE",
    insuranceExpiryDate: "2026-12-31",
    inspectionExpiryDate: "2026-09-20",
    notes: "Climatização revista recentemente.",
  },
  {
    id: "veh-03",
    plateNumber: "LD-77-90-FK",
    model: "Toyota Coaster (30 Lugares)",
    capacity: 30,
    driverName: "Sr. Bernardo António",
    driverPhone: "+244 924 889 001",
    monitorName: "D. Teresa Van-Dúnem",
    monitorPhone: "+244 933 667 889",
    status: "ACTIVE",
    insuranceExpiryDate: "2027-01-15",
    inspectionExpiryDate: "2026-12-05",
  },
];

const INITIAL_ROUTES: TransportRoute[] = [
  {
    id: "rt-01",
    code: "ROTA-01",
    name: "Centralidade do Kilamba • Camama • Talatona",
    shift: "BOTH",
    vehicleId: "veh-01",
    vehiclePlate: "LD-48-22-GA",
    driverName: "Sr. Mateus Domingos Panzo",
    driverPhone: "+244 923 110 221",
    monitorName: "D. Madalena Sebastião",
    monitorPhone: "+244 912 334 556",
    maxCapacity: 30,
    assignedStudentsCount: 4,
    isActive: true,
    stops: [
      {
        id: "stp-01",
        name: "Bloco W (Junto ao Kero Kilamba)",
        order: 1,
        estimatedPickupTime: "06:15",
        estimatedDropoffTime: "13:30",
        landmark: "Rotunda dos Ws",
      },
      {
        id: "stp-02",
        name: "Jardim do Éden (Camama)",
        order: 2,
        estimatedPickupTime: "06:35",
        estimatedDropoffTime: "13:50",
        landmark: "Entrada do condomínio",
      },
      {
        id: "stp-03",
        name: "Belas Shopping (Talatona)",
        order: 3,
        estimatedPickupTime: "06:50",
        estimatedDropoffTime: "14:10",
        landmark: "Paragem dos táxis / Bombas Pumangol",
      },
      {
        id: "stp-04",
        name: "Complexo Escolar MindSchool (Campus)",
        order: 4,
        estimatedPickupTime: "07:15",
        estimatedDropoffTime: "14:30",
        landmark: "Portaria Principal da Escola",
      },
    ],
  },
  {
    id: "rt-02",
    code: "ROTA-02",
    name: "Viana • Grafanil • Via Expressa",
    shift: "BOTH",
    vehicleId: "veh-02",
    vehiclePlate: "LD-65-19-HY",
    driverName: "Sr. João Manuel Kiala",
    driverPhone: "+244 931 445 667",
    monitorName: "D. Esperança Afonso",
    monitorPhone: "+244 945 778 990",
    maxCapacity: 15,
    assignedStudentsCount: 2,
    isActive: true,
    stops: [
      {
        id: "stp-05",
        name: "Vila de Viana (Ponte Amarela)",
        order: 1,
        estimatedPickupTime: "06:10",
        estimatedDropoffTime: "13:40",
      },
      {
        id: "stp-06",
        name: "Multiperfil (Morro Bento)",
        order: 2,
        estimatedPickupTime: "06:45",
        estimatedDropoffTime: "14:05",
      },
      {
        id: "stp-07",
        name: "Complexo Escolar MindSchool (Campus)",
        order: 3,
        estimatedPickupTime: "07:15",
        estimatedDropoffTime: "14:30",
      },
    ],
  },
  {
    id: "rt-03",
    code: "ROTA-03",
    name: "Maianga • Alvalade • Miramar",
    shift: "MORNING",
    vehicleId: "veh-03",
    vehiclePlate: "LD-77-90-FK",
    driverName: "Sr. Bernardo António",
    driverPhone: "+244 924 889 001",
    monitorName: "D. Teresa Van-Dúnem",
    monitorPhone: "+244 933 667 889",
    maxCapacity: 30,
    assignedStudentsCount: 2,
    isActive: true,
    stops: [
      {
        id: "stp-08",
        name: "Largo do Kinaxixi / Miramar",
        order: 1,
        estimatedPickupTime: "06:20",
        estimatedDropoffTime: "13:35",
      },
      {
        id: "stp-09",
        name: "Praça Alvalade",
        order: 2,
        estimatedPickupTime: "06:40",
        estimatedDropoffTime: "13:55",
      },
      {
        id: "stp-10",
        name: "Complexo Escolar MindSchool (Campus)",
        order: 3,
        estimatedPickupTime: "07:15",
        estimatedDropoffTime: "14:30",
      },
    ],
  },
];

const INITIAL_ASSIGNMENTS: StudentTransportAssignment[] = [
  {
    id: "asg-01",
    studentId: "stu-01",
    studentNumber: "MS-2026-0042",
    studentName: "Nzuzi Maria Afonso",
    classLevel: "10ª Classe",
    sectionName: "Turma 10A",
    routeId: "rt-01",
    stopId: "stp-01",
    stopName: "Bloco W (Junto ao Kero Kilamba)",
    shift: "BOTH",
    guardianName: "Ana Paula Afonso",
    guardianPhone: "+244 923 456 789",
    assignedAt: "2026-01-15",
    isActive: true,
  },
  {
    id: "asg-02",
    studentId: "stu-02",
    studentNumber: "MS-2026-0089",
    studentName: "Mauro António Gaspar",
    classLevel: "11ª Classe",
    sectionName: "Turma 11B",
    routeId: "rt-01",
    stopId: "stp-02",
    stopName: "Jardim do Éden (Camama)",
    shift: "BOTH",
    guardianName: "António Gaspar",
    guardianPhone: "+244 931 112 233",
    assignedAt: "2026-01-15",
    isActive: true,
  },
  {
    id: "asg-03",
    studentId: "stu-03",
    studentNumber: "MS-2026-0105",
    studentName: "Esperança Domingos",
    classLevel: "8ª Classe",
    sectionName: "Turma 8A",
    routeId: "rt-01",
    stopId: "stp-03",
    stopName: "Belas Shopping (Talatona)",
    shift: "BOTH",
    guardianName: "Teresa Manuel Domingos",
    guardianPhone: "+244 945 889 900",
    assignedAt: "2026-01-18",
    isActive: true,
  },
  {
    id: "asg-04",
    studentId: "stu-04",
    studentNumber: "MS-2026-0120",
    studentName: "Joaquim Bernardo Silva",
    classLevel: "7ª Classe",
    sectionName: "Turma 7C",
    routeId: "rt-02",
    stopId: "stp-05",
    stopName: "Vila de Viana (Ponte Amarela)",
    shift: "BOTH",
    guardianName: "Helena Silva",
    guardianPhone: "+244 912 345 678",
    assignedAt: "2026-01-20",
    isActive: true,
  },
];

const TODAY_STR = new Date().toISOString().split("T")[0];

const INITIAL_BOARDING_LOGS: DailyBoardingRecord[] = [
  {
    id: "bdg-01",
    date: TODAY_STR,
    routeId: "rt-01",
    routeName: "Centralidade do Kilamba • Camama • Talatona",
    shift: "MORNING",
    studentId: "stu-01",
    studentName: "Nzuzi Maria Afonso",
    studentNumber: "MS-2026-0042",
    stopName: "Bloco W (Junto ao Kero Kilamba)",
    status: "DROPPED_OFF",
    checkedAt: "06:18",
    checkedBy: "D. Madalena Sebastião",
    guardianNotified: true,
    notes: "Embarcou no horário previsto e desembarcou na escola às 07:12.",
  },
  {
    id: "bdg-02",
    date: TODAY_STR,
    routeId: "rt-01",
    routeName: "Centralidade do Kilamba • Camama • Talatona",
    shift: "MORNING",
    studentId: "stu-02",
    studentName: "Mauro António Gaspar",
    studentNumber: "MS-2026-0089",
    stopName: "Jardim do Éden (Camama)",
    status: "DROPPED_OFF",
    checkedAt: "06:37",
    checkedBy: "D. Madalena Sebastião",
    guardianNotified: true,
  },
  {
    id: "bdg-03",
    date: TODAY_STR,
    routeId: "rt-01",
    routeName: "Centralidade do Kilamba • Camama • Talatona",
    shift: "MORNING",
    studentId: "stu-03",
    studentName: "Esperança Domingos",
    studentNumber: "MS-2026-0105",
    stopName: "Belas Shopping (Talatona)",
    status: "BOARDED",
    checkedAt: "06:53",
    checkedBy: "D. Madalena Sebastião",
    guardianNotified: true,
  },
  {
    id: "bdg-04",
    date: TODAY_STR,
    routeId: "rt-02",
    routeName: "Viana • Grafanil • Via Expressa",
    shift: "MORNING",
    studentId: "stu-04",
    studentName: "Joaquim Bernardo Silva",
    studentNumber: "MS-2026-0120",
    stopName: "Vila de Viana (Ponte Amarela)",
    status: "DROPPED_OFF",
    checkedAt: "06:15",
    checkedBy: "D. Esperança Afonso",
    guardianNotified: true,
  },
];

export const useTransportStore = create<TransportState>()(
  persist(
    (set, get) => ({
      vehicles: INITIAL_VEHICLES,
      routes: INITIAL_ROUTES,
      assignments: INITIAL_ASSIGNMENTS,
      boardingLogs: INITIAL_BOARDING_LOGS,
      selectedRouteId: "rt-01",
      searchQuery: "",

      setSelectedRouteId: (selectedRouteId) => set({ selectedRouteId }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),

      addVehicle: (vehicleData) => {
        const newVehicle: SchoolVehicle = {
          ...vehicleData,
          id: `veh-${Date.now()}`,
        };
        set((state) => ({ vehicles: [...state.vehicles, newVehicle] }));
        return newVehicle;
      },

      updateVehicle: (id, data) => {
        set((state) => ({
          vehicles: state.vehicles.map((v) => (v.id === id ? { ...v, ...data } : v)),
        }));
      },

      addRoute: (routeData) => {
        const newRoute: TransportRoute = {
          ...routeData,
          id: `rt-${Date.now()}`,
          assignedStudentsCount: 0,
        };
        set((state) => ({ routes: [...state.routes, newRoute] }));
        return newRoute;
      },

      updateRoute: (id, data) => {
        set((state) => ({
          routes: state.routes.map((r) => (r.id === id ? { ...r, ...data } : r)),
        }));
      },

      assignStudentToRoute: (data) => {
        const newAssignment: StudentTransportAssignment = {
          ...data,
          id: `asg-${Date.now()}`,
          assignedAt: new Date().toISOString().split("T")[0],
          isActive: true,
        };

        set((state) => {
          const updatedRoutes = state.routes.map((r) => {
            if (r.id === data.routeId) {
              return { ...r, assignedStudentsCount: r.assignedStudentsCount + 1 };
            }
            return r;
          });

          return {
            assignments: [...state.assignments, newAssignment],
            routes: updatedRoutes,
          };
        });

        return newAssignment;
      },

      removeStudentFromRoute: (assignmentId) => {
        set((state) => {
          const assignment = state.assignments.find((a) => a.id === assignmentId);
          if (!assignment) return state;

          const updatedRoutes = state.routes.map((r) => {
            if (r.id === assignment.routeId) {
              return {
                ...r,
                assignedStudentsCount: Math.max(0, r.assignedStudentsCount - 1),
              };
            }
            return r;
          });

          return {
            assignments: state.assignments.filter((a) => a.id !== assignmentId),
            routes: updatedRoutes,
          };
        });
      },

      updateBoardingStatus: (logId, status, checkedBy, notes) => {
        set((state) => ({
          boardingLogs: state.boardingLogs.map((log) => {
            if (log.id === logId) {
              return {
                ...log,
                status,
                checkedAt: new Date().toLocaleTimeString("pt-AO", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                checkedBy: checkedBy || log.checkedBy,
                notes: notes || log.notes,
              };
            }
            return log;
          }),
        }));
      },
    }),
    {
      name: "mindschool-transport-storage",
    }
  )
);
