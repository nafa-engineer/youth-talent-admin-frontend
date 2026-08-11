"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table"
import { Skeleton } from "../ui/skeleton"

export interface ColumnDef<TData> {
  header: React.ReactNode
  accessorKey?: keyof TData | string
  render?: (row: TData, index: number) => React.ReactNode
  className?: string
}

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[]
  data: TData[]
  isLoading?: boolean
  skeletonRows?: number
  emptyMessage?: string
  onRowClick?: (row: TData) => void
}

export function DataTable<TData>({
  columns,
  data,
  isLoading = false,
  skeletonRows = 5,
  emptyMessage = "Tidak ada data.",
  onRowClick,
}: DataTableProps<TData>) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow>
            {columns.map((column, index) => (
              <TableHead 
                key={index} 
                className={column.className}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: skeletonRows }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((column, colIndex) => (
                  <TableCell key={colIndex}>
                    <Skeleton className="h-5 w-full rounded-md" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, rowIndex) => (
              <TableRow
                key={rowIndex}
                onClick={() => onRowClick?.(row)}
                className={onRowClick ? "cursor-pointer hover:bg-muted/40 transition-colors" : ""}
              >
                {columns.map((column, colIndex) => {
                  let cellContent: React.ReactNode = ""

                  if (column.render) {
                    cellContent = column.render(row, rowIndex)
                  } else if (column.accessorKey) {
                    const value = (row as Record<string, unknown>)[column.accessorKey as string]
                    cellContent = value !== undefined && value !== null ? String(value) : "-"
                  }

                  return (
                    <TableCell 
                      key={colIndex}
                      className={column.className}
                    >
                      {cellContent}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
