import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components";

export function ItemPaginationControls({
  page,
  totalPages,
  setPage,
  goToNextPage,
  goToPreviousPage,
}: {
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
}) {
  return (
    <div className="w-full flex items-center justify-center">
      <Pagination className="w-max">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                goToPreviousPage();
              }}
              aria-disabled={page === 1}
            />
          </PaginationItem>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
            .map((pageNumber) => (
              <PaginationItem key={pageNumber}>
                <PaginationLink
                  //className="data-active:bg-primary data-active:text-primary-foreground"
                  href="#"
                  isActive={page === pageNumber}
                  onClick={(e) => {
                    e.preventDefault();
                    setPage(pageNumber);
                  }}
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            ))}

          {totalPages > page + 2 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                goToNextPage();
              }}
              aria-disabled={page === totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
