"use client";

import { useMemo, useState } from "react";
import { Tax } from "@/types";

export interface TaxOption {
  value: string;
  label: string;
  rate: number;
}

const STANDARD_TAXES: Tax[] = [
  {
    id: "tax-0",
    name: "Isento (Regime de Ensino - Art. 12.º CIVA)",
    type: "IVA",
    rate: 0,
    description: "Isenção de IVA para serviços de educação e ensino",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tax-14",
    name: "IVA Geral (14%)",
    type: "IVA",
    rate: 14,
    description: "Taxa Geral de IVA",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tax-7",
    name: "IVA Reduzido (7%)",
    type: "IVA",
    rate: 7,
    description: "Taxa Reduzida de IVA",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tax-5",
    name: "IVA Simplificado (5%)",
    type: "IVA",
    rate: 5,
    description: "Regime Simplificado",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function useGetTaxes() {
  const [taxSearch, setTaxSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const taxOptions: TaxOption[] = useMemo(
    () =>
      STANDARD_TAXES.filter((t) =>
        t.name.toLowerCase().includes(taxSearch.toLowerCase())
      ).map((t) => ({
        value: t.id,
        label: `${t.name}`,
        rate: t.rate,
      })),
    [taxSearch]
  );

  return {
    taxes: STANDARD_TAXES,
    data: STANDARD_TAXES,
    taxOptions,
    pagination: { totalPages: 1, currentPage, page: currentPage },
    setPage: setCurrentPage,
    taxSearch,
    setTaxSearch,
    isLoading: false,
    error: null,
  };
}
