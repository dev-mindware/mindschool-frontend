"use client";

import React, { useState } from "react";
import { useLibraryStore } from "@/stores/school/library-store";
import { BookCatalogView } from "./book-catalog-view";
import { LoansManagementView } from "./loans-management-view";
import { NewLoanModal } from "./new-loan-modal";
import { NewBookModal } from "./new-book-modal";
import { ClearanceCertificateModal } from "./clearance-certificate-modal";
import { LibraryBook } from "@/types";
import { Button, Icon, Tabs, TabsContent, TabsList, TabsTrigger, TitleList } from "@/components";
import { DynamicMetricCard } from "@/components/shared/dynamic-metric-card";

export function LibraryPageContent() {
  const { books, loans } = useLibraryStore();

  const [activeTab, setActiveTab] = useState<string>("CATALOG");
  const [newBookModalOpen, setNewBookModalOpen] = useState(false);
  const [newLoanModalOpen, setNewLoanModalOpen] = useState(false);
  const [clearanceModalOpen, setClearanceModalOpen] = useState(false);
  const [selectedBookForLoan, setSelectedBookForLoan] = useState<LibraryBook | null>(null);

  // Metrics
  const totalTitles = books.length;
  const totalCopies = books.reduce((acc, b) => acc + b.totalCopies, 0);
  const activeLoans = loans.filter((l) => l.status === "ACTIVE").length;
  const overdueLoans = loans.filter((l) => l.status === "OVERDUE").length;
  const medBooksCopies = books
    .filter((b) => b.isMedTextbook)
    .reduce((acc, b) => acc + b.totalCopies, 0);

  const handleOpenLoanWithBook = (book?: LibraryBook) => {
    setSelectedBookForLoan(book || null);
    setNewLoanModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* MindGest Standard TitleList */}
      <TitleList
        title="Biblioteca Escolar"
        suTitle="Acervo de manuais escolares do MED, empréstimos e declarações."
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setClearanceModalOpen(true)}
            className="gap-2 shadow-xs text-xs"
          >
            <Icon name="ShieldCheck" className="size-4" />
            Emitir "Nada Consta"
          </Button>

          <Button
            size="sm"
            onClick={() => handleOpenLoanWithBook()}
            className="gap-2 shadow-xs text-xs"
          >
            <Icon name="BookOpen" className="size-4" />
            Novo Empréstimo
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setNewBookModalOpen(true)}
            className="gap-2 shadow-xs text-xs"
          >
            <Icon name="Plus" className="size-4" />
            Cadastrar Livro
          </Button>
        </div>
      </TitleList>

      {/* KPI Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DynamicMetricCard
          title={`${totalCopies}`}
          subtitle="Exemplares no Acervo"
          description={`${totalTitles} títulos catalogados`}
          icon="BookMarked"
        />

        <DynamicMetricCard
          title={`${activeLoans} Obras`}
          subtitle="Empréstimos Activos"
          description="Em posse de estudantes e docentes"
          icon="BookOpen"
        />

        <DynamicMetricCard
          title={`${overdueLoans} Atrasos`}
          subtitle="Devoluções Vencidas"
          description="Alerta de pendência na biblioteca"
          icon="CircleAlert"
          colors={overdueLoans > 0 ? "destructive" : "default"}
        />

        <DynamicMetricCard
          title={`${medBooksCopies}`}
          subtitle="Manuais Oficiais do MED"
          description="Distribuição do ensino geral"
          icon="Layers"
        />
      </div>

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 w-full sm:w-[500px]">
          <TabsTrigger value="CATALOG" className="gap-1.5 text-xs">
            <Icon name={"BookMarked" as any} className="size-3.5" />
            Acervo & Manuais do MED
          </TabsTrigger>
          <TabsTrigger value="LOANS" className="gap-1.5 text-xs">
            <Icon name={"Clock" as any} className="size-3.5" />
            Balcão de Empréstimos ({activeLoans + overdueLoans})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Catalog */}
        <TabsContent value="CATALOG" className="space-y-4 pt-1">
          <BookCatalogView
            onOpenNewBookModal={() => setNewBookModalOpen(true)}
            onOpenLoanModal={handleOpenLoanWithBook}
          />
        </TabsContent>

        {/* Tab 2: Loans */}
        <TabsContent value="LOANS" className="space-y-4 pt-1">
          <LoansManagementView
            onOpenNewLoanModal={() => handleOpenLoanWithBook()}
          />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <NewBookModal
        open={newBookModalOpen}
        onOpenChange={setNewBookModalOpen}
      />

      <NewLoanModal
        open={newLoanModalOpen}
        onOpenChange={setNewLoanModalOpen}
        preselectedBook={selectedBookForLoan}
      />

      <ClearanceCertificateModal
        open={clearanceModalOpen}
        onOpenChange={setClearanceModalOpen}
      />
    </div>
  );
}
