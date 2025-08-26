
"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface DataTablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
}

export function DataTablePagination({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
}: DataTablePaginationProps) {
  const canPreviousPage = currentPage > 1;
  const canNextPage = currentPage < totalPages;

  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="flex-1 text-sm text-muted-foreground">
        نمایش {startItem} تا {endItem} از {totalItems} مورد
      </div>
      <div className="flex items-center space-x-2 space-x-reverse"> {/* Added space-x-reverse for RTL */}
        <Button
          variant="outline"
          className="hidden h-8 w-8 p-0 lg:flex"
          onClick={() => onPageChange(1)}
          disabled={!canPreviousPage}
        >
          <span className="sr-only">برو به اولین صفحه</span>
          <ChevronsRight className="h-4 w-4" /> {/* ChevronsLeft becomes ChevronsRight */}
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canPreviousPage}
        >
          <span className="sr-only">برو به صفحه قبل</span>
          <ChevronRight className="h-4 w-4" /> {/* ChevronLeft becomes ChevronRight */}
        </Button>
        <div className="flex items-center justify-center text-sm font-medium">
          صفحه {currentPage} از {totalPages}
        </div>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canNextPage}
        >
          <span className="sr-only">برو به صفحه بعد</span>
          <ChevronLeft className="h-4 w-4" /> {/* ChevronRight becomes ChevronLeft */}
        </Button>
        <Button
          variant="outline"
          className="hidden h-8 w-8 p-0 lg:flex"
          onClick={() => onPageChange(totalPages)}
          disabled={!canNextPage}
        >
          <span className="sr-only">برو به آخرین صفحه</span>
          <ChevronsLeft className="h-4 w-4" /> {/* ChevronsRight becomes ChevronsLeft */}
        </Button>
      </div>
    </div>
  );
}
