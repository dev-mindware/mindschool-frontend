"use client";
import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Button,
  TitleList,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components";
import {
  AddProductModal,
  EditProductModal,
  ProductList,
  ServiceList,
  ServiceModal,
} from "@/components/client";
import { currentProductStore, useModal } from "@/stores";
import { ChevronDown, Plus, Barcode, Keyboard } from "lucide-react";
import { BarcodeScannerModal, BARCODE_SCANNER_MODAL_ID } from "./products/product-modals/barcode-scanner-modal";
import { FeatureGate } from "@/components";
import { ProtectedAction } from "@/components/guards";

type ItemTab = "product" | "service";

const TAB_LABELS: Record<ItemTab, string> = {
  product: "Produto",
  service: "Serviço",
};

const TAB_MODALS: Record<ItemTab, string> = {
  product: "add-product",
  service: "add-service",
};

export function ItemsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openModal, open } = useModal();
  const { currentProduct } = currentProductStore();
  const activeTab = (searchParams.get("tab") as ItemTab) ?? "product";

  const handleTabChange = useCallback(
    (value: ItemTab | string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", value);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  return (
    <div className="space-y-6">
      <div data-tour="items-header">
      <TitleList
        title={activeTab === "product" ? "Produtos" : "Serviços"}
        suTitle={`Faça a gestão dos seus ${activeTab === "product" ? "produtos" : "serviços"
          } listados.`}
      />
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="w-full sm:w-auto" data-tour="items-tabs">
            <TabsTrigger value="product" className="flex-1 sm:flex-none">
              Produtos
            </TabsTrigger>
            <TabsTrigger value="service" className="flex-1 sm:flex-none">
              Serviços
            </TabsTrigger>
          </TabsList>

          {activeTab === "product" ? (
            <div data-tour="items-create">
            <DropdownMenu>
              <ProtectedAction>
                <DropdownMenuTrigger asChild>
                  <Button className="flex items-center gap-2 w-full sm:w-auto">
                    <Plus className="h-4 w-4" />
                    Novo Produto
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
              </ProtectedAction>
              <DropdownMenuContent align="end" className="w-48">
                <ProtectedAction>
                  <DropdownMenuItem
                    data-tour="items-create-manual"
                    onClick={() => openModal("add-product")}
                    className="flex items-center gap-2"
                  >
                    <Keyboard className="h-4 w-4" />
                    Manual
                  </DropdownMenuItem>
                </ProtectedAction>
                
                <FeatureGate minPlan="Pro" fallback="disabled">
                  <ProtectedAction>
                    <DropdownMenuItem
                      data-tour="items-create-barcode"
                      onClick={() => openModal(BARCODE_SCANNER_MODAL_ID)}
                      className="flex items-center gap-2"
                    >
                      <Barcode className="h-4 w-4" />
                      Código de Barra
                    </DropdownMenuItem>
                  </ProtectedAction>
                </FeatureGate>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
          ) : (
            <div data-tour="items-create">
              <ProtectedAction>
                <Button
                  onClick={() => openModal(TAB_MODALS[activeTab])}
                  className="w-full sm:w-auto"
                >
                  {`Novo ${TAB_LABELS[activeTab]}`}
                </Button>
              </ProtectedAction>
            </div>
          )}
        </div>

        <TabsContent value="product" data-tour="items-list">
          <ProductList />
        </TabsContent>

        <TabsContent value="service" data-tour="items-list">
          <ServiceList />
        </TabsContent>
      </Tabs>

      {open["add-product"] && <AddProductModal />}

      {open["edit-product"] && currentProduct && <EditProductModal product={currentProduct} />}
      {open["add-service"] && <ServiceModal action="add" />}
      <BarcodeScannerModal />
    </div>
  );
}
