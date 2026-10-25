"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { subscriptionService, type OrderRequest } from "@/services/subscription-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";

/** Subscricao da escola ativa: estado, catalogo, simulacao (quote), ordens e comprovativo de pagamento. */
export function useSubscription() {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const qc = useQueryClient();
  const on = Boolean(schoolId);
  const catalog = useQuery({ queryKey: ["subscription-catalog"], queryFn: subscriptionService.catalog, staleTime: 10 * 60 * 1000 });
  const current = useQuery({ queryKey: ["subscription", schoolId], queryFn: subscriptionService.current, enabled: on, staleTime: 30 * 1000 });
  const orders = useQuery({ queryKey: ["subscription-orders", schoolId], queryFn: subscriptionService.orders, enabled: on, staleTime: 15 * 1000 });
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["subscription", schoolId] });
    qc.invalidateQueries({ queryKey: ["subscription-orders", schoolId] });
  };
  const quote = useMutation({ mutationFn: (v: OrderRequest) => subscriptionService.quote(v) });
  const createOrder = useMutation({ mutationFn: (v: OrderRequest) => subscriptionService.createOrder(v), onSuccess: refresh });
  const cancelOrder = useMutation({ mutationFn: subscriptionService.cancelOrder, onSuccess: refresh });
  const submitProof = useMutation({ mutationFn: (v: { orderId: string; file: File }) => subscriptionService.submitProof(v.orderId, v.file), onSuccess: refresh });
  const cancelSubscription = useMutation({ mutationFn: (reason: string) => subscriptionService.cancelSubscription(reason), onSuccess: refresh });
  return { catalog: catalog.data, current: current.data, orders: orders.data ?? [], isLoading: catalog.isLoading || current.isLoading, quote, createOrder, cancelOrder, submitProof, cancelSubscription };
}
