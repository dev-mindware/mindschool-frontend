"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { CategorySelector, ProductList } from "./products";
import { CartList } from "./cart";
import {
  BarcodeProductScanner,
} from "./modals";
import { currentStoreStore } from "@/stores";
import { useGetCategories, useGetItems, useGetCurrentSession } from "@/hooks";
import { useQueryState } from "nuqs";
import {
  PosCategorySkeleton,
  PosProductSectionSkeleton,
  PosCartSkeleton,
  Tabs, TabsContent, TabsList, TabsTrigger,
  ScrollArea
} from "@/components";
import { Product, CartType, CartItem as TypeCartItem } from "@/types";
import { useCounterState, useIsMobile } from "@/hooks";
import { useGetProductCountsByCategory } from "@/hooks/stock/use-items";
import { MobilePosLayout } from "../mobile";

export function CounterContent() {
  const [search] = useQueryState("search", { defaultValue: "" });
  const { categories, isLoading: isLoadingCategories } = useGetCategories();
  const {
    data: productCountsByCategory = {},
    isLoading: isLoadingProductCounts,
  } = useGetProductCountsByCategory();
  const [activeCart, setActiveCart] = useState<CartType>("invoice");
  const { currentStore } = currentStoreStore();
  const { data: currentSession } = useGetCurrentSession(currentStore?.id);

  const availableCategories = useMemo(
    () =>
      categories
        .map((category) => ({
          ...category,
          itemsCount: productCountsByCategory[category.id] ?? 0,
        }))
        .filter((category) => category.itemsCount > 0)
        .sort((a, b) => b.itemsCount - a.itemsCount),
    [categories, productCountsByCategory],
  );

  const [selectedCategory, setSelectedCategory] = useState<string>("");

  useEffect(() => {
    if (availableCategories.length === 0) {
      setSelectedCategory("");
      return;
    }

    const selectedCategoryIsAvailable = availableCategories.some(
      (category) => category.id === selectedCategory,
    );

    if (!selectedCategoryIsAvailable) {
      setSelectedCategory(availableCategories[0].id);
    }
  }, [availableCategories, selectedCategory]);

  const { items: apiProducts, isLoading: isLoadingProducts } = useGetItems({
    search: search || undefined,
    categoryId: selectedCategory || undefined,
    type: "PRODUCT",
    limit: 100,
  });

  // Use custom hook for cart state management
  const {
    scannedProduct,
    onConfirmScan,
    handleAddToCart,
    handleRemoveFromCart,
    handleDeleteItem,
    handleUpdateQuantity,
    handleClearCart,
    getCartItemsArray,
    findProductByBarcode,
    handleManualScan,
  } = useCounterState({ apiProducts, activeCart });

  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
  }, []);

  const currentCategoryName = useMemo(() =>
    availableCategories.find((c) => c.id === selectedCategory)?.name
    , [availableCategories, selectedCategory]);

  const products: Product[] = useMemo(() =>
    (apiProducts as any[]).map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price || 0,
      image: p.image,
      category: p.category?.name || "",
      quantity: p.quantity || p.reserved || 0,
      reserved: p.reserved || 0,
      description: p.description,
      barcode: p.barcode,
      sku: p.sku,
      tax: p.tax,
    })), [apiProducts]);

  const cartItemsMap = useMemo(() =>
    getCartItemsArray(activeCart).reduce((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {} as Record<string, any>)
    , [activeCart, getCartItemsArray]);

  const isMobile = useIsMobile();

  const handleUpdateQtyInvoice = useCallback((item: any, delta: number) =>
    handleUpdateQuantity(item.id, item.qty + delta)
    , [handleUpdateQuantity]);

  const handleUpdateQtyProforma = useCallback((item: any, delta: number) =>
    handleUpdateQuantity(item.id, item.qty + delta)
    , [handleUpdateQuantity]);

  const handleClearCartInvoice = useCallback(() => handleClearCart("invoice"), [handleClearCart]);
  const handleClearCartProforma = useCallback(() => handleClearCart("proforma"), [handleClearCart]);

  if (isMobile) {
    return (
      <MobilePosLayout
        products={products}
        categories={availableCategories}
        cartItems={getCartItemsArray(activeCart)}
        onAddToCart={handleAddToCart}
        onUpdateQty={(item: TypeCartItem, delta: number) => handleUpdateQuantity(item.id, item.qty + delta)}
        onRemove={handleRemoveFromCart}
        onProcessTransaction={() => {
            // Logic to open checkout drawer/modal for mobile
            // For now, we can use the existing CartList logic but in a mobile way
        }}
        onScan={handleManualScan}
        onResolveScan={findProductByBarcode}
        activeCategory={selectedCategory}
        onCategoryChange={handleCategorySelect}
        isLoading={
          isLoadingCategories || isLoadingProductCounts || isLoadingProducts
        }
        cashSessionId={currentSession?.id || ""}
      />
    );
  }

  return (
    <div className="flex h-full overflow-hidden">
      <BarcodeProductScanner
        scannedProduct={scannedProduct}
        onConfirm={onConfirmScan}
      />
      <div className="flex-1 flex flex-col min-w-0 gap-4 p-4">
        {isLoadingCategories || isLoadingProductCounts ? (
          <PosCategorySkeleton />
        ) : (
          <CategorySelector
            categories={availableCategories}
            activeCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
          />
        )}

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {currentCategoryName || "Todos"}
          </h2>
        </div>

        <ScrollArea className="flex-1 pb-4">
          {isLoadingProducts ? (
            <PosProductSectionSkeleton />
          ) : (
            <ProductList
              products={products}
              cartItems={cartItemsMap}
              onAddToCart={handleAddToCart}
              onRemoveFromCart={handleRemoveFromCart}
              onUpdateQuantity={handleUpdateQuantity}
            />
          )}
        </ScrollArea>
      </div>

      {/* Right Content - Cart & Payment */}
      <div className="w-[400px] flex flex-col border-l border-border/50 bg-sidebar/30">
        <Tabs value={activeCart} onValueChange={(v) => setActiveCart(v as CartType)} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 m-4 mb-0" data-tour="pos-document-tabs">
            <TabsTrigger value="invoice">Facturação</TabsTrigger>
            <TabsTrigger value="proforma" data-tour="pos-document-tab-proforma">Proforma</TabsTrigger>
          </TabsList>

          <TabsContent value="invoice" className="flex-1 mt-0">
            {isLoadingCategories || !currentSession?.id ? (
              <PosCartSkeleton />
            ) : (
              <CartList
                type="invoice"
                cartItems={getCartItemsArray("invoice")}
                onUpdateQty={handleUpdateQtyInvoice}
                onRemove={handleRemoveFromCart}
                onDelete={handleDeleteItem}
                onClearCart={handleClearCartInvoice}
                cashSessionId={currentSession.id}
              />
            )}
          </TabsContent>

          <TabsContent value="proforma" className="flex-1 mt-0">
            {isLoadingCategories || !currentSession?.id ? (
              <PosCartSkeleton />
            ) : (
              <CartList
                type="proforma"
                cartItems={getCartItemsArray("proforma")}
                onUpdateQty={handleUpdateQtyProforma}
                onRemove={handleRemoveFromCart}
                onDelete={handleDeleteItem}
                onClearCart={handleClearCartProforma}
                cashSessionId={currentSession.id}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
