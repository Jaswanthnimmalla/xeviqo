// src/components/ui/TableHelpers.tsx
import React from "react";
import { ChevronLeft, ChevronRight, Loader2, Inbox } from "lucide-react";

// ============================================
// Empty State Component
// ============================================
interface EmptyStateProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No data found",
  subtitle = "Try adjusting your search or filters.",
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon || (
        <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-4 mb-4">
          <Inbox className="h-8 w-8 text-slate-400 dark:text-slate-500" />
        </div>
      )}
      <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-1">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {subtitle}
      </p>
    </div>
  );
};

// ============================================
// Table Skeleton Loader
// ============================================
interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 6,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700/60">
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-4 sm:px-6 py-4">
                <div className="h-3 w-20 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40">
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i}>
              {Array.from({ length: columns }).map((_, j) => (
                <td key={j} className="px-4 sm:px-6 py-4">
                  <div className="h-4 w-full rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ============================================
// Pagination Component
// ============================================
interface PaginationProps {
  page: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalItems,
  pageSize,
  onPageChange,
  siblingCount = 1,
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);

  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const leftSibling = Math.max(page - siblingCount, 1);
    const rightSibling = Math.min(page + siblingCount, totalPages);
    const showLeftDots = leftSibling > 2;
    const showRightDots = rightSibling < totalPages - 1;

    pages.push(1);

    if (showLeftDots) {
      pages.push("...");
    }

    for (let i = leftSibling; i <= rightSibling; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i);
      }
    }

    if (showRightDots) {
      pages.push("...");
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 py-4 border-t border-slate-200 dark:border-slate-700/60">
      <div className="text-sm text-slate-500 dark:text-slate-400">
        Showing <span className="font-medium text-slate-700 dark:text-slate-300">{startItem}</span> to{" "}
        <span className="font-medium text-slate-700 dark:text-slate-300">{endItem}</span> of{" "}
        <span className="font-medium text-slate-700 dark:text-slate-300">{totalItems}</span> results
      </div>

      <nav className="flex items-center gap-1" aria-label="Pagination">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {getPageNumbers().map((pageNum, index) =>
          typeof pageNum === "number" ? (
            <button
              key={index}
              onClick={() => onPageChange(pageNum)}
              className={`min-w-[2rem] h-8 rounded-lg text-sm font-medium transition-colors ${
                page === pageNum
                  ? "bg-[#6C63FF] text-white"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              aria-current={page === pageNum ? "page" : undefined}
            >
              {pageNum}
            </button>
          ) : (
            <span key={index} className="px-1 text-slate-400 text-sm">
              {pageNum}
            </span>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
};

// ============================================
// Loading Spinner
// ============================================
export const LoadingSpinner: React.FC<{ size?: "sm" | "md" | "lg"; className?: string }> = ({
  size = "md",
  className = "",
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-[#6C63FF]`} />
    </div>
  );
};

// ============================================
// Table Header with Sorting
// ============================================
interface SortableHeaderProps {
  label: string;
  sortKey: string;
  currentSort: { key: string; direction: "asc" | "desc" };
  onSort: (key: string) => void;
  className?: string;
}

export const SortableHeader: React.FC<SortableHeaderProps> = ({
  label,
  sortKey,
  currentSort,
  onSort,
  className = "",
}) => {
  const isActive = currentSort.key === sortKey;

  return (
    <th
      className={`px-4 sm:px-6 py-3 font-medium text-left cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 transition-colors ${className}`}
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {label}
        <span className="text-xs opacity-50">
          {isActive ? (currentSort.direction === "asc" ? "↑" : "↓") : "↕"}
        </span>
      </div>
    </th>
  );
};

// ============================================
// Table Row Actions
// ============================================
interface TableActionsProps {
  children: React.ReactNode;
  className?: string;
}

export const TableActions: React.FC<TableActionsProps> = ({
  children,
  className = "",
}) => {
  return (
    <div className={`flex items-center justify-end gap-1 ${className}`}>
      {children}
    </div>
  );
};

// ============================================
// Action Button
// ============================================
interface ActionButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label?: string;
  color?: "default" | "primary" | "danger" | "success";
  className?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  icon,
  label,
  color = "default",
  className = "",
}) => {
  const colorClasses = {
    default: "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800",
    primary: "text-[#6C63FF] hover:text-[#5b53e6] hover:bg-[#6C63FF]/10",
    danger: "text-red-500 hover:text-red-600 hover:bg-red-500/10",
    success: "text-green-500 hover:text-green-600 hover:bg-green-500/10",
  };

  return (
    <button
      onClick={onClick}
      className={`p-1.5 rounded-lg transition-colors ${colorClasses[color]} ${className}`}
      aria-label={label}
      title={label}
    >
      {icon}
    </button>
  );
};

// ============================================
// Table with Built-in Features (Comprehensive)
// ============================================
interface TableColumn<T> {
  key: string;
  header: string;
  cell: (item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
}

interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  onRowClick?: (item: T) => void;
  emptyState?: React.ReactNode;
  className?: string;
}

export function Table<T extends { id: string | number }>({
  data,
  columns,
  loading = false,
  onRowClick,
  emptyState,
  className = "",
}: TableProps<T>) {
  if (loading) {
    return <TableSkeleton rows={5} columns={columns.length} />;
  }

  if (data.length === 0) {
    return emptyState || <EmptyState />;
  }

  const visibleColumns = columns.filter((col) => {
    // All columns visible by default, hide based on responsive classes
    return true;
  });

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700/60">
            {visibleColumns.map((col) => (
              <th
                key={col.key}
                className={`px-4 sm:px-6 py-3 font-medium ${
                  col.hideOnMobile ? "hidden sm:table-cell" : ""
                } ${col.hideOnTablet ? "hidden md:table-cell" : ""} ${col.className || ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40">
          {data.map((item) => (
            <tr
              key={item.id}
              onClick={() => onRowClick?.(item)}
              className={`transition-colors ${
                onRowClick ? "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50" : ""
              }`}
            >
              {visibleColumns.map((col) => (
                <td
                  key={col.key}
                  className={`px-4 sm:px-6 py-3 ${
                    col.hideOnMobile ? "hidden sm:table-cell" : ""
                  } ${col.hideOnTablet ? "hidden md:table-cell" : ""} ${col.className || ""}`}
                >
                  {col.cell(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================
// Batch Actions Toolbar
// ============================================
interface BatchActionsProps {
  selectedCount: number;
  onClearSelection: () => void;
  actions: Array<{
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    color?: "default" | "danger" | "primary";
  }>;
  className?: string;
}

export const BatchActions: React.FC<BatchActionsProps> = ({
  selectedCount,
  onClearSelection,
  actions,
  className = "",
}) => {
  if (selectedCount === 0) return null;

  return (
    <div
      className={`flex items-center gap-3 px-4 sm:px-6 py-3 bg-[#6C63FF]/5 border-b border-slate-200 dark:border-slate-700/60 ${className}`}
    >
      <span className="text-sm text-slate-600 dark:text-slate-300">
        <span className="font-semibold">{selectedCount}</span> selected
      </span>
      <button
        onClick={onClearSelection}
        className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
      >
        Clear
      </button>
      <div className="flex-1" />
      <div className="flex gap-2">
        {actions.map((action, index) => {
          const colorClasses = {
            default: "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
            primary: "text-[#6C63FF] hover:bg-[#6C63FF]/10",
            danger: "text-red-500 hover:bg-red-500/10",
          };

          return (
            <button
              key={index}
              onClick={action.onClick}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${colorClasses[action.color || "default"]}`}
            >
              {action.icon}
              {action.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ============================================
// usePagination Hook
// ============================================
export function usePagination<T>(items: T[], pageSize: number = 10) {
  const [page, setPage] = React.useState(1);

  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const currentItems = items.slice(startIndex, endIndex);

  const goToPage = (newPage: number) => {
    const clamped = Math.max(1, Math.min(newPage, totalPages || 1));
    setPage(clamped);
  };

  const nextPage = () => goToPage(page + 1);
  const prevPage = () => goToPage(page - 1);
  const resetPage = () => setPage(1);

  React.useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  return {
    page,
    totalItems,
    totalPages,
    currentItems,
    goToPage,
    nextPage,
    prevPage,
    resetPage,
    startIndex,
    endIndex,
  };
}

export default {
  EmptyState,
  TableSkeleton,
  Pagination,
  LoadingSpinner,
  SortableHeader,
  TableActions,
  ActionButton,
  Table,
  BatchActions,
  usePagination,
};