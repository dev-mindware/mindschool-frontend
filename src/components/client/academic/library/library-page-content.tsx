"use client";

import { Button, Can, Icon, Tabs, TabsContent, TabsList, TabsTrigger, TitleList } from "@/components";
import { DynamicMetricCard } from "@/components/shared/dynamic-metric-card";
import { useLibrary } from "@/hooks/school/use-library";
import { useModal } from "@/stores/modal/use-modal-store";
import { BookCatalogView } from "./book-catalog-view";
import { LoansManagementView } from "./loans-management-view";
import { NewLoanModal } from "./new-loan-modal";
import { PortalRequestsView } from "./portal-requests-view";
import { NewBookModal } from "./new-book-modal";
import { ClearanceCertificateModal } from "./clearance-certificate-modal";

export function LibraryPageContent() {
  const { metrics } = useLibrary();
  const { openModal } = useModal();

  return (
    <div className="space-y-6">
      <TitleList title="Biblioteca Escolar" suTitle="Gestão do acervo bibliográfico, empréstimos e devoluções.">
        <div className="flex items-center gap-2" data-tour="library-actions">
          <Button variant="outline" size="sm" onClick={() => openModal("library-clearance")} className="gap-2">
            <Icon name="ShieldCheck" className="size-4" />
            Nada Consta
          </Button>
          <Can permission="library:write">
          <Button size="sm" variant="outline" onClick={() => openModal("library-new-book")} className="gap-2">
            <Icon name="Plus" className="size-4" />
            Cadastrar Obra
          </Button>
          <Button size="sm" onClick={() => openModal("library-new-loan")} className="gap-2">
            <Icon name="BookOpen" className="size-4" />
            Novo Empréstimo
          </Button>
          </Can>
        </div>
      </TitleList>

      <div className="grid grid-cols-2 gap-3 md:gap-4 @5xl/main:grid-cols-4">
        <DynamicMetricCard title={`${metrics.copies}`} subtitle="Exemplares no Acervo" description={`${metrics.titles} títulos catalogados`} icon="BookMarked" />
        <DynamicMetricCard title={`${metrics.active}`} subtitle="Empréstimos Ativos" description="Em posse de alunos e docentes" icon="BookOpen" />
        <DynamicMetricCard title={`${metrics.overdue}`} subtitle="Devoluções Vencidas" description="Bloqueiam novos empréstimos do leitor" icon="CircleAlert" colors={metrics.overdue > 0 ? "destructive" : "default"} />
        <DynamicMetricCard title="14 dias" subtitle="Prazo de Empréstimo" description="Até 2 renovações; máximo de 3 obras por aluno" icon="Clock" />
      </div>

      <Tabs defaultValue="catalog" className="space-y-2">
        <TabsList>
          <TabsTrigger value="catalog" className="gap-1.5"><Icon name="BookMarked" className="size-4" />Acervo</TabsTrigger>
          <TabsTrigger value="loans" className="gap-1.5"><Icon name="Clock" className="size-4" />Empréstimos ({metrics.active})</TabsTrigger>
          <TabsTrigger value="requests" className="gap-1.5"><Icon name="Inbox" className="size-4" />Pedidos do portal</TabsTrigger>
        </TabsList>
        <TabsContent value="catalog"><BookCatalogView /></TabsContent>
        <TabsContent value="loans"><LoansManagementView /></TabsContent>
        <TabsContent value="requests"><PortalRequestsView /></TabsContent>
      </Tabs>

      <NewBookModal />
      <NewLoanModal />
      <ClearanceCertificateModal />
    </div>
  );
}
