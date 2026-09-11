"use client";
import { usePagination, useURLSearchParams } from "@/hooks/common";
import { CategoryCardView } from "./category-card-view";
import {
  Column,
  RequestError,
  GenericTable,
  ListSkeleton,
  ButtonOnlyAction,
  ProductCardSkeletonGrid,
  ItemStatusBadge,
  ItemViewToggle,
  ItemPaginationControls,
  EmptyState,
} from "@/components";
import { Category } from "@/types";
import { formatDateTime } from "@/utils";
import { useDebounce } from "use-debounce";
import { useCategoryActions, useCategoryFilters } from "@/hooks";
import { CategoriesFilters } from "./category-filters";
import {
  CategoryModal,
  DeleteCategoryModal,
  DetailsCategoryModal,
} from "./categories-modals";
import { currentStoreStore } from "@/stores";

export function CategoriesList() {
  const { search } = useURLSearchParams("search-category");
  const [debounceSearch] = useDebounce(search, 200);
  const { currentStore } = currentStoreStore();
  const { filters, page, setPage } =
    useCategoryFilters();
  const {
    toggleStatusCategory,
    handlerEditCategory,
    handlerDetailsCategory,
  } = useCategoryActions();
  const {
    total,
    data: categories,
    totalPages,
    goToNextPage,
    goToPreviousPage,
    isLoading,
    isError,
    refetch,
  } = usePagination<Category>({
    endpoint: "/categories",
    queryKey: ["categories"],
    queryParams: { ...filters, storeId: currentStore?.id, search: debounceSearch },
  });

  const columns: Column<Category>[] = [
    { key: "name", header: "Nome" },
    {
      key: "status",
      header: "Status",
      render: (_, item) => (
        <ItemStatusBadge status={item.isActive ? "ACTIVE" : "INACTIVE"} />
      ),
    },
    {
      key: "createdAt",
      header: "Criado em",
      render: (_, item) => (
        <div className="text-sm text-foreground">
          {formatDateTime(item.createdAt)}
        </div>
      ),
    },
    {
      key: "updatedAt",
      header: "Actualizado em",
      render: (_, item) => (
        <div className="text-sm text-foreground">
          {formatDateTime(item.updatedAt)}
        </div>
      ),
    },
    {
      key: "action",
      header: "Acção",
      render: (_, item) => (
        <ButtonOnlyAction
          data={item}
          actions={[
            {
              label: "Ver detalhes",
              onClick: handlerDetailsCategory,
              icon: "Eye",
              variant: "default",
            },
            {
              label: "Editar",
              onClick: handlerEditCategory,
              icon: "Pencil",
              variant: "default",
            },
            {
              label: item.isActive ? "Desactivar" : "Activar",
              onClick: toggleStatusCategory,
              icon: "CirclePower",
              variant: "default",
            },
          ]}
        />
      ),
    },
  ];

  if (isLoading)
    return <ListSkeleton />;

  if (isError) {
    return (
      <RequestError
        refetch={refetch}
        message="Erro ao carregar as categorias"
      />
    );
  }


  console.log(categories);

  return (

    <div className="justify-start mt-6 space-y-8">
      <CategoriesFilters />

      {categories.length > 0 ? (
        <>
          <GenericTable<Category>
            page={page}
            total={total}
            setPage={setPage}
            data={categories}
            columns={columns}
            totalPages={totalPages}
            goToNextPage={goToNextPage}
            goToPreviousPage={goToPreviousPage}
          />
        </>
      ) : (
        <div className="w-full justify-start mt-6 space-y-8">
          <EmptyState
            description="Adicione novas categorias"
            title="Sem Categorias"
            icon="FileText"
          />
        </div>
      )}

      <DeleteCategoryModal />
      <DetailsCategoryModal />
      <CategoryModal action="edit" />
    </div>
  );
}

