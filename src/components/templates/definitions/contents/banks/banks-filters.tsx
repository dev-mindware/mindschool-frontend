"use client";

import { useURLSearchParams } from "@/hooks/common";
import { SearchHandlerWrapper } from "@/components/common";

export function BanksFilters() {
  const { search, setSearch } = useURLSearchParams("search_bank");

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex gap-3 w-full sm:w-auto">
        <div className="flex-1 w-full sm:w-80">
          <SearchHandlerWrapper
            search={search}
            setSearch={setSearch}
            className="w-full"
            placeholder="Pesquisar bancos"
          />
        </div>
      </div>
    </div>
  );
}
