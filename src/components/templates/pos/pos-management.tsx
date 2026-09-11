"use client";
import React, { useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CashStats } from "./partitions/cash-stats";
import { CashOpeningNotification } from "./partitions/cash-opening-notification";
import { CashierCard } from "./partitions/cashier-card";
import { CashOpeningForm } from "./partitions/cash-opening-form";
import { Cashier, OpenCashRegister } from "@/types/cashier";

const cashiers: Cashier[] = [
  {
    id: 1,
    name: "João Afonso Raimundo",
    cashNumber: "01",
    totalSold: 3800000,
    activityTime: "05:52",
    progress: 75,
    status: "Ativo",
  },
  {
    id: 2,
    name: "Maria Luísa Fernandes",
    cashNumber: "02",
    totalSold: 1500000,
    activityTime: "03:15",
    progress: 50,
    status: "Pausado",
  },
  {
    id: 3,
    name: "Carlos Alberto Silva",
    cashNumber: "03",
    totalSold: 2000000,
    activityTime: "04:10",
    progress: 60,
    status: "Inativo",
  },
  {
    id: 4,
    name: "Ana Paula Gomes",
    cashNumber: "04",
    totalSold: 2500000,
    activityTime: "02:45",
    progress: 40,
    status: "Fechado",
  },
  {
    id: 5,
    name: "Ricardo José Mendes",
    cashNumber: "05",
    totalSold: 3200000,
    activityTime: "06:00",
    progress: 80,
    status: "Ativo",
  },
  {
    id: 6,
    name: "Fernanda Dias Sousa",
    cashNumber: "06",
    totalSold: 1750000,
    activityTime: "03:30",
    progress: 55,
    status: "Ativo",
  },
];

export function PosManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<Cashier["status"] | "Todos">("Todos");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [openCashRegisters, setOpenCashRegisters] = useState<OpenCashRegister[]>([]);

  const statusOptions: (Cashier["status"] | "Todos")[] = ["Todos", "Ativo", "Inativo", "Pausado", "Fechado"];

  const filteredCashiers = cashiers.filter((cashier) => {
    const matchesSearch =
      cashier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cashier.cashNumber.includes(searchTerm);
    const matchesStatus = statusFilter === "Todos" || cashier.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const addCashierToOpening = (cashier: Pick<Cashier, "name" | "cashNumber">) => {
    const isAlreadyAdded = openCashRegisters.some(
      (openCashier) => openCashier.cashNumber === cashier.cashNumber
    );
    if (!isAlreadyAdded) {
      setOpenCashRegisters((prev) => [
        ...prev,
        { id: Date.now(), name: cashier.name, cashNumber: cashier.cashNumber },
      ]);
    }
  };

  const removeCashierFromOpening = (cashierId: number) => {
    setOpenCashRegisters((prev) => prev.filter((cashier) => cashier.id !== cashierId));
  };

  const handleFormSubmit = (data: FormData) => {
    console.log("Form submitted:", { openCashRegisters, ...data });
    // lógica adicional ou chamada de API
  };

  return (
    <div className="min-h-screen bg-background">
      <div>
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-bold text-foreground">Controlo de caixas</h1>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <CashStats />

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute w-4 h-4 text-gray-400 left-3 top-3" />
                <Input
                  placeholder="Pesquisar por nome ou número do caixa"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                >
                  Estado: {statusFilter}
                  <ChevronDown className="w-4 h-4" />
                </Button>
                {showStatusDropdown && (
                  <div className="absolute right-0 z-10 w-48 mt-1 border rounded-md shadow-lg bg-background">
                    {statusOptions.map((status) => (
                      <button
                        key={status}
                        className="block w-full px-4 py-2 text-left cursor-pointer hover:bg-gray-100"
                        onClick={() => {
                          setStatusFilter(status);
                          setShowStatusDropdown(false);
                        }}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filteredCashiers.length > 0 ? (
                filteredCashiers.map((cashier) => (
                  <CashierCard key={cashier.id} cashier={cashier} onAdd={addCashierToOpening} />
                ))
              ) : (
                <div className="col-span-2 py-8 text-center">
                  <p className="text-gray-500">Não foi encontrado qualquer caixa com os filtros seleccionados.</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <CashOpeningForm
              openCashRegisters={openCashRegisters}
              onRemove={removeCashierFromOpening}
              onSubmit={handleFormSubmit}
              onCancel={() => setOpenCashRegisters([])}
            />
            <CashOpeningNotification />
          </div>
        </div>
      </div>
    </div>
  );
}
