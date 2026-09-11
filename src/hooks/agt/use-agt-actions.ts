"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useModal } from "@/stores";
import type { AgtTab } from "@/types";

export function useAgtActions() {
  const { openModal } = useModal();
  const router = useRouter();
  const searchParams = useSearchParams();

  function handlerRequestSeries() {
    openModal("request-agt-series");
  }

  function handlerConsultInvoice(documentNo: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "agt");
    params.set("agtTab", "consultation");
    params.set("docNo", documentNo);
    router.push(`?${params.toString()}`, { scroll: false });
  }

  function setAgtTab(tab: AgtTab) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "agt");
    params.set("agtTab", tab);
    if (tab !== "consultation") {
      params.delete("docNo");
    }
    router.push(`?${params.toString()}`, { scroll: false });
  }

  function clearDocNo() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("docNo");
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  return {
    handlerRequestSeries,
    handlerConsultInvoice,
    setAgtTab,
    clearDocNo,
  };
}
