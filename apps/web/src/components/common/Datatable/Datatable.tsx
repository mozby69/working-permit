"use client";
import type { ReactNode } from "react";


import {
  useMemo,
  useState,
} from "react";

import {
  ChevronLeft,
  ChevronRight,
  Search,
  Loader2,
} from "lucide-react";


export interface TableColumn<T> {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  className?: string;
}

export interface TableFilterOption {
  label: string;
  value: string;
}

export interface DataTableProps<T> {
  title: string;
  description?: string;

  columns: TableColumn<T>[];
  data: T[];

  getRowId: (row: T) => string | number;

  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchFn?: (row: T, search: string) => boolean;

  filterOptions?: TableFilterOption[];
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterFn?: (row: T, filter: string) => boolean;

  pageSize?: number;
  isLoading?: boolean;
  emptyMessage?: string;

  onRowClick?: (row: T) => void;

  /**
   * Enable when data is already paginated by the API.
   */
  manualPagination?: boolean;
  totalRows?: number;
  page?: number;
  onPageChange?: (page: number) => void;

  actions?: ReactNode;
}


















export default function DataTable<T>({
  title,
  description,
  columns,
  data,
  getRowId,

  searchPlaceholder = "Search records...",
  searchValue,
  onSearchChange,
  searchFn,

  filterOptions,
  filterValue,
  onFilterChange,
  filterFn,

  pageSize = 10,
  isLoading = false,
  emptyMessage = "No records found.",

  onRowClick,

  manualPagination = false,
  totalRows,
  page,
  onPageChange,

  actions,
}: DataTableProps<T>) {
  const [internalSearch, setInternalSearch] = useState("");
  const [internalFilter, setInternalFilter] = useState("all");
  const [internalPage, setInternalPage] = useState(1);

  const search = searchValue ?? internalSearch;
  const filter = filterValue ?? internalFilter;
  const currentPage = page ?? internalPage;

  const handleSearch = (value: string) => {
    if (onSearchChange) {
      onSearchChange(value);
    } else {
      setInternalSearch(value);
    }

    if (onPageChange) {
      onPageChange(1);
    } else {
      setInternalPage(1);
    }
  };

  const handleFilter = (value: string) => {
    if (onFilterChange) {
      onFilterChange(value);
    } else {
      setInternalFilter(value);
    }

    if (onPageChange) {
      onPageChange(1);
    } else {
      setInternalPage(1);
    }
  };

  const filteredData = useMemo(() => {
    if (manualPagination) {
      return data;
    }

    return data.filter((row) => {
      const matchesSearch =
        !search.trim() ||
        !searchFn ||
        searchFn(row, search.trim().toLowerCase());

      const matchesFilter =
        filter === "all" ||
        !filterFn ||
        filterFn(row, filter);

      return matchesSearch && matchesFilter;
    });
  }, [
    data,
    search,
    filter,
    searchFn,
    filterFn,
    manualPagination,
  ]);

 const rowCount = manualPagination
  ? totalRows ?? data.length
  : filteredData.length;

const totalPages = Math.max(
  1,
  Math.ceil(rowCount / pageSize)
);

// Automatically clamp the displayed page
// without updating state during an effect.
const safePage = Math.min(
  Math.max(1, currentPage),
  totalPages
);

const paginatedData = manualPagination
  ? filteredData
  : filteredData.slice(
      (safePage - 1) * pageSize,
      safePage * pageSize
    );

const startRow =
  rowCount === 0
    ? 0
    : (safePage - 1) * pageSize + 1;

const endRow = Math.min(
  safePage * pageSize,
  rowCount
);
const changePage = (nextPage: number) => {
  const targetPage = Math.min(
    Math.max(1, nextPage),
    totalPages
  );

  if (targetPage === safePage) {
    return;
  }

  if (onPageChange) {
    onPageChange(targetPage);
  } else {
    setInternalPage(targetPage);
  }
};

  return (
    <div className="w-full overflow-hidden rounded-[14px] border border-[#E2E5DE] bg-[#FCFCFA] shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-[#E8EAE5] px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h2 className="text-[14px] font-semibold text-[#26342F]">
            {title}
          </h2>

          {description && (
            <p className="mt-1 text-[11px] text-[#929A93]">
              {description}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative min-w-40 flex-1 sm:w-55 sm:flex-none">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA39B]"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                handleSearch(event.target.value)
              }
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className="
                h-9 w-full rounded-[9px]
                border border-[#E0E4DD]
                bg-[#F8F9F6]
                pl-9 pr-3
                text-[12px] text-[#26342F]
                outline-none transition
                placeholder:text-[#A0A9A1]
                focus:border-[#8DAA98]
                focus:ring-2 focus:ring-[#8DAA98]/15
              "
            />
          </div>

          {/* Filter */}
          {filterOptions &&
            filterOptions.length > 0 && (
              <select
                value={filter}
                onChange={(event) =>
                  handleFilter(event.target.value)
                }
                aria-label="Filter records"
                className="
                  h-9 rounded-[9px]
                  border border-[#E0E4DD]
                  bg-[#F8F9F6]
                  px-3 text-[12px]
                  text-[#68776D]
                  outline-none
                  focus:border-[#8DAA98]
                "
              >
                {filterOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            )}

          {actions}
        </div>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-162.5 border-collapse text-left">
          <thead>
            <tr className="border-b border-[#E8EAE5]">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`
                    px-5 py-3
                    text-[10px] font-semibold
                    uppercase tracking-[0.12em]
                    text-[#98A199]
                    ${column.className ?? ""}
                  `}
                >
                  {column.header}
                </th>
              ))}

              {onRowClick && (
                <th
                  scope="col"
                  className="w-12 px-4 py-3"
                >
                  <span className="sr-only">
                    Actions
                  </span>
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={
                    columns.length +
                    (onRowClick ? 1 : 0)
                  }
                  className="h-44 text-center"
                >
                  <div className="flex items-center justify-center gap-2 text-[12px] text-[#929A93]">
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Loading records...
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    columns.length +
                    (onRowClick ? 1 : 0)
                  }
                  className="h-44 text-center text-[12px] text-[#929A93]"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => (
                <tr
                  key={getRowId(row)}
                  onClick={
                    onRowClick
                      ? () => onRowClick(row)
                      : undefined
                  }
                  onKeyDown={
                    onRowClick
                      ? (event) => {
                          if (
                            event.key === "Enter" ||
                            event.key === " "
                          ) {
                            event.preventDefault();
                            onRowClick(row);
                          }
                        }
                      : undefined
                  }
                  tabIndex={
                    onRowClick ? 0 : undefined
                  }
                  className={`
                    border-b border-[#EDF0EA]
                    transition-colors
                    last:border-b-0
                    hover:bg-[#F5F7F2]
                    ${
                      onRowClick
                        ? "cursor-pointer focus-visible:bg-[#F0F3ED] focus-visible:outline-2 focus-visible:outline-[#8DAA98]"
                        : ""
                    }
                  `}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`
                        px-5 py-3.5
                        text-[12px] text-[#526058]
                        ${column.className ?? ""}
                      `}
                    >
                      {column.render(row)}
                    </td>
                  ))}

                  {onRowClick && (
                    <td className="px-4 py-3.5 text-right">
                      <ChevronRight
                        size={16}
                        className="text-[#A8B0A8]"
                      />
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-3 border-t border-[#E8EAE5] px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] text-[#929A93]">
          Showing {startRow}–{endRow} of{" "}
          {rowCount} records
        </p>

        <div className="flex items-center gap-2">
          <span className="mr-2 text-[11px] text-[#929A93]">
            Page {safePage} of {totalPages}
          </span>

          <button
            type="button"
            onClick={() =>
              changePage(safePage - 1)
            }
            disabled={
              safePage === 1 || isLoading
            }
            aria-label="Previous page"
            className="
              flex h-8 w-8 items-center justify-center
              rounded-lg border border-[#E0E4DD]
              text-[#68776D]
              transition-colors hover:bg-[#EEF1EB]
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            <ChevronLeft size={16} />
          </button>

          <button
            type="button"
            onClick={() =>
              changePage(safePage + 1)
            }
            disabled={
              safePage === totalPages ||
              isLoading
            }
            aria-label="Next page"
            className="
              flex h-8 w-8 items-center justify-center
              rounded-lg border border-[#E0E4DD]
              text-[#68776D]
              transition-colors hover:bg-[#EEF1EB]
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
