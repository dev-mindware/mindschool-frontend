"use client";

import { useState } from "react";
import { MobileNavBar, MobileTab } from "./mobile-nav-bar";
import { MobileMenuView } from "./mobile-menu-view";
import { MobileOrderView } from "./mobile-order-view";
import { MobileScannerView } from "./mobile-scanner-view";
import { Product, CartItem, CartType } from "@/types";
import { MovementsContent } from "@/components/client/pos/movements/movements-content";
import { PosSettingsSetup } from "@/components/client/pos/settings/pos-settings-setup";
import { MobileCheckoutDrawer } from "./mobile-checkout-drawer";

interface MobilePosLayoutProps {
  products: Product[];
  categories: any[];
  cartItems: CartItem[];
  onAddToCart: (product: Product) => void;
  onUpdateQty: (item: CartItem, delta: number) => void;
  onRemove: (id: string) => void;
  onProcessTransaction: () => void;
  onScan: (barcode: string) => void;
  onResolveScan: (barcode: string) => Promise<Product | null>;
  activeCategory: string;
  onCategoryChange: (id: string) => void;
  isLoading?: boolean;
  cashSessionId: string;
}

export function MobilePosLayout({
  products,
  categories,
  cartItems,
  onAddToCart,
  onUpdateQty,
  onRemove,
  onProcessTransaction,
  onScan,
  onResolveScan,
  activeCategory,
  onCategoryChange,
  isLoading,
  cashSessionId
}: MobilePosLayoutProps) {
  const [activeTab, setActiveTab] = useState<MobileTab>("home");
  const [showScanner, setShowScanner] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  if (showScanner) {
    return (
      <MobileScannerView 
        cartItems={cartItems}
        onScan={onScan}
        onResolveScan={onResolveScan}
        onAddToCart={onAddToCart}
        onPay={() => {
            setShowScanner(false);
            setActiveTab("order");
            setIsCheckoutOpen(true);
        }}
        onOpenMenu={() => setShowScanner(false)}
      />
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <MobileMenuView 
            products={products}
            categories={categories}
            onAddToCart={onAddToCart}
            onUpdateQty={onUpdateQty}
            onRemove={onRemove}
            activeCategory={activeCategory}
            onCategoryChange={onCategoryChange}
            isLoading={isLoading}
            onViewOrder={() => setActiveTab("order")}
            cartItems={cartItems}
          />
        );
      case "order":
        return (
          <MobileOrderView 
            cartItems={cartItems}
            onUpdateQty={onUpdateQty}
            onRemove={onRemove}
            onProcessTransaction={() => setIsCheckoutOpen(true)}
            onBack={() => setActiveTab("home")}
          />
        );
      case "history":
        return (
          <div className="flex-1 overflow-hidden pb-16">
             <MovementsContent />
          </div>
        );
      case "profile":
        return (
          <div className="flex-1 overflow-auto pb-16">
             <PosSettingsSetup />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-background relative">
      {renderContent()}
      
      {/* Floating Scanner Button only on Home */}
      {activeTab === "home" && (
          <button 
            onClick={() => setShowScanner(true)}
            className="fixed bottom-20 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center z-40 active:scale-95"
          >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 7V5C3 3.89543 3.89543 3 5 3H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M17 3H19C20.1046 3 21 3.89543 21 5V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M21 17V19C21 20.1046 20.1046 21 19 21H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M7 21H5C3.89543 21 3 20.1046 3 19V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M7 12H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
          </button>
      )}

      <MobileNavBar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        cartCount={cartCount}
      />

      <MobileCheckoutDrawer 
        open={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
        cartItems={cartItems}
        cashSessionId={cashSessionId}
        onSuccess={() => {
            setActiveTab("home");
        }}
      />
    </div>
  );
}
