"use client";

import React from "react";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number; // 0-based
  pageSize: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  isLoading?: boolean;
  pageSizeOptions?: number[];
}

export function Pagination({
  page,
  pageSize,
  totalPages,
  totalElements,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
  pageSizeOptions = [10, 20, 50, 100],
}: PaginationProps) {
  const from = totalElements === 0 ? 0 : page * pageSize + 1;
  const to = Math.min((page + 1) * pageSize, totalElements);
  const canPrev = page > 0 && !isLoading;
  const canNext = page + 1 < totalPages && !isLoading;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 py-2">
      <span className="text-xs font-medium text-muted-foreground">
        Menampilkan {from}–{to} dari {totalElements} data
      </span>

      <div className="flex items-center gap-3">
        {onPageSizeChange && (
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            Baris:
            <select
              className="h-8 rounded-lg border border-input bg-transparent px-2 text-xs outline-none focus-visible:border-ring"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              disabled={isLoading}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1"
            onClick={() => onPageChange(page - 1)}
            disabled={!canPrev}
          >
            <ChevronLeft className="h-4 w-4" />
            Sebelumnya
          </Button>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            Hal. {totalPages === 0 ? 0 : page + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1"
            onClick={() => onPageChange(page + 1)}
            disabled={!canNext}
          >
            Berikutnya
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
