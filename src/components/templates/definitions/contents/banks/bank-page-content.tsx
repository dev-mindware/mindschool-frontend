import { Separator, TitleList } from "@/components";
import { BankList } from "./banks-list";

export function BankPageContent() {
  return (
    <div data-tour="setup-banks-content">
      <TitleList
        title="Bancos"
        suTitle="Crie bancos que ajudarão no controlo das suas finanças"
      />

      <BankList />
    </div>
  );
}
