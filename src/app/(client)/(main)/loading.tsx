import { ListSkeleton } from "@/components/common/skeletons";

/** Estado de carregamento de qualquer página da área autenticada (a barra lateral mantém-se visível). */
export default function Loading() {
  return (
    <div className="p-4 md:p-6" aria-busy="true" aria-live="polite">
      <div className="mb-4 h-8 w-64 animate-pulse rounded bg-muted" />
      <div className="h-4 w-96 max-w-full animate-pulse rounded bg-muted" />
      <ListSkeleton rows={6} cols={4} />
    </div>
  );
}
