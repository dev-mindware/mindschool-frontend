"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { groupsService, type GroupRole } from "@/services/groups-service";

/** Grupos educativos do utilizador (multi-escola): painel consolidado e gestao de membros do proprio grupo. */
export function useGroups(groupId?: string) {
  const qc = useQueryClient();
  const groups = useQuery({ queryKey: ["groups"], queryFn: groupsService.mine, staleTime: 60 * 1000, retry: false });
  const group = groups.data?.find((g) => g.id === groupId);
  const canManage = Boolean(group?.permissions.includes("group:manage_members"));
  const canRefresh = Boolean(group?.permissions.includes("group:refresh"));

  const dashboard = useQuery({ queryKey: ["group-dashboard", groupId], queryFn: () => groupsService.dashboard(groupId!), enabled: Boolean(groupId), staleTime: 30 * 1000, retry: false });
  const members = useQuery({ queryKey: ["group-members", groupId], queryFn: () => groupsService.members(groupId!), enabled: Boolean(groupId && canManage), staleTime: 30 * 1000 });

  const refreshMembers = () => qc.invalidateQueries({ queryKey: ["group-members", groupId] });
  const refresh = useMutation({ mutationFn: () => groupsService.refresh(groupId!), onSuccess: () => qc.invalidateQueries({ queryKey: ["group-dashboard", groupId] }) });
  const addMember = useMutation({ mutationFn: (v: { email: string; role: GroupRole }) => groupsService.addMember(groupId!, v.email, v.role), onSuccess: refreshMembers });
  const setRole = useMutation({ mutationFn: (v: { userId: string; role: GroupRole }) => groupsService.setRole(groupId!, v.userId, v.role), onSuccess: refreshMembers });
  const removeMember = useMutation({ mutationFn: (userId: string) => groupsService.removeMember(groupId!, userId), onSuccess: refreshMembers });

  return {
    groups: groups.data ?? [], isLoading: groups.isLoading, group, canManage, canRefresh,
    dashboard: dashboard.data, dashboardLoading: dashboard.isLoading, members: members.data ?? [], refresh, addMember, setRole, removeMember,
  };
}
