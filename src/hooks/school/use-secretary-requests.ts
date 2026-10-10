"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { secretaryRequestsService, type ApiRequest, type NewRequest, type RequestStatus } from "@/services/secretary-requests-service";
import { studentsService } from "@/services/students-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";

/** Pedidos aos servicos da secretaria. `portal` = vista do encarregado/aluno (so os seus pedidos). */
export function useSecretaryRequests(portal = false, enabled = true) {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const queryClient = useQueryClient();
  const key = ["secretary-requests", schoolId, portal];
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "ALL">("ALL");

  const { data: all = [], isLoading } = useQuery({ queryKey: key, queryFn: () => secretaryRequestsService.list(portal), enabled: Boolean(schoolId) && enabled, staleTime: 15 * 1000 });
  // Nomes dos alunos (a lista de pedidos so traz o id); so a secretaria os le.
  const { data: students = [] } = useQuery({ queryKey: ["students", schoolId], queryFn: () => studentsService.list(), enabled: Boolean(schoolId) && !portal && enabled, staleTime: 60 * 1000 });
  const nameOf = useMemo(() => new Map(students.map((s) => [s.id, s.fullName])), [students]);

  const requests = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return all.filter(
      (r) =>
        (statusFilter === "ALL" || r.status === statusFilter) &&
        (!q || r.protocol.toLowerCase().includes(q) || r.subject.toLowerCase().includes(q) || (r.student_id ? (nameOf.get(r.student_id) ?? "").toLowerCase().includes(q) : false)),
    );
  }, [all, searchQuery, statusFilter, nameOf]);

  const refresh = (id?: string) => {
    queryClient.invalidateQueries({ queryKey: key });
    if (id) queryClient.invalidateQueries({ queryKey: ["secretary-request", schoolId, portal, id] });
  };

  const create = useMutation({ mutationFn: (v: NewRequest) => secretaryRequestsService.create(v, portal), onSuccess: () => refresh() });
  const assign = useMutation({ mutationFn: secretaryRequestsService.assign, onSuccess: (r) => refresh(r.id) });
  const setStatus = useMutation({
    mutationFn: (v: { id: string; status: "em_analise" | "concluido" | "rejeitado"; resolution?: string; waiveFee?: boolean }) => secretaryRequestsService.setStatus(v.id, v.status, v.resolution, v.waiveFee),
    onSuccess: (r) => refresh(r.id),
  });
  const comment = useMutation({ mutationFn: (v: { id: string; message: string }) => secretaryRequestsService.comment(v.id, v.message, portal), onSuccess: (_d, v) => refresh(v.id) });
  const cancel = useMutation({ mutationFn: secretaryRequestsService.cancel, onSuccess: (r) => refresh(r.id) });

  const counts = {
    total: all.length,
    open: all.filter((r) => r.status === "aberto").length,
    awaitingPayment: all.filter((r) => r.status === "aguarda_pagamento").length,
    inReview: all.filter((r) => r.status === "em_analise").length,
    done: all.filter((r) => r.status === "concluido").length,
  };

  return { requests, all, isLoading, counts, nameOf, searchQuery, setSearchQuery, statusFilter, setStatusFilter, create, assign, setStatus, comment, cancel };
}

/** Pedido com o historico (eventos). */
export function useSecretaryRequest(id: string | undefined, portal = false): { data: ApiRequest | undefined; isLoading: boolean } {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const { data, isLoading } = useQuery({
    queryKey: ["secretary-request", schoolId, portal, id],
    queryFn: () => secretaryRequestsService.get(id!, portal),
    enabled: Boolean(schoolId && id),
  });
  return { data, isLoading };
}
