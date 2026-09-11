import { useModal } from "@/stores/modal/use-modal-store";
import { StockResponse } from "@/types/stock";
import { currentStockStore } from "@/stores/stock";

export function useStockActions() {
  const { openModal } = useModal();
  const { setCurrentStock } = currentStockStore();

  function handlerEditStock(stock: StockResponse) {
    openModal("edit-stock");
    setCurrentStock(stock);
  }

  function handlerDetailsStock(stock: StockResponse) {
    openModal("view-stock");
    setCurrentStock(stock);
  }

  function handlerDeleteStock(stock: StockResponse) {
    openModal("delete-stock");
    setCurrentStock(stock);
  }

  function handlerAdjustStock(stock: StockResponse) {
    openModal("adjust-stock");
    setCurrentStock(stock);
  }

  function handlerReserveStock(stock: StockResponse) {
    openModal("reserve-stock");
    setCurrentStock(stock);
  }

  function handlerUnreserveStock(stock: StockResponse) {
    openModal("unreserve-stock");
    setCurrentStock(stock);
  }

  return {
    handlerDeleteStock,
    handlerDetailsStock,
    handlerEditStock,
    handlerAdjustStock,
    handlerReserveStock,
    handlerUnreserveStock,
  };
}
