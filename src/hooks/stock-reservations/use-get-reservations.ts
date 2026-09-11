import { useQuery } from "@tanstack/react-query";
import { stockReservationsService } from "@/services";

export function useGetReservations() {
  return useQuery({
    queryKey: ["stock-reservations"],
    queryFn: async () => {
      const response = await stockReservationsService.getAllReservations();
      console.log("Minhas reservas:", response.data);
      return response.data;
    },
  });
}
