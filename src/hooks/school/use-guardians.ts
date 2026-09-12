"use client";

import { useState, useMemo } from "react";
import { useSchoolDataStore } from "@/stores/school/school-data-store";
import { PreferredContactChannel } from "@/types";

export function useGuardians(
  searchQuery = "",
  channelFilter: PreferredContactChannel | "ALL" = "ALL"
) {
  const { guardians } = useSchoolDataStore();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredGuardians = useMemo(() => {
    return guardians.filter((guardian) => {
      const matchesSearch =
        !searchQuery ||
        guardian.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (guardian.phonePrimary || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (guardian.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (guardian.idDocumentNumber || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesChannel =
        channelFilter === "ALL" || guardian.preferredContactChannel === channelFilter;

      return matchesSearch && matchesChannel;
    });
  }, [guardians, searchQuery, channelFilter]);

  const total = filteredGuardians.length;
  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));

  const paginatedGuardians = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredGuardians.slice(start, start + itemsPerPage);
  }, [filteredGuardians, currentPage]);

  const counts = useMemo(() => {
    return {
      total: guardians.length,
      whatsapp: guardians.filter((g) => g.preferredContactChannel === "WHATSAPP").length,
      sms: guardians.filter((g) => g.preferredContactChannel === "SMS").length,
      email: guardians.filter((g) => g.preferredContactChannel === "EMAIL").length,
    };
  }, [guardians]);

  return {
    guardians: paginatedGuardians,
    allGuardians: filteredGuardians,
    total,
    totalPages,
    currentPage,
    setCurrentPage,
    goToNextPage: () => setCurrentPage((p) => Math.min(totalPages, p + 1)),
    goToPreviousPage: () => setCurrentPage((p) => Math.max(1, p - 1)),
    counts,
  };
}
