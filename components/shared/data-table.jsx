import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingRows } from "@/components/shared/loading-state";
import { cn } from "@/lib/utils";

/**
 * @param {{
 *   columns: { key: string, header: string, render?: (row: any) => React.ReactNode, className?: string }[],
 *   rows: any[], rowKey?: (row: any) => string | number,
 *   isLoading?: boolean, isError?: boolean, onRetry?: () => void,
 *   emptyTitle?: string, emptyDescription?: string,
 *   onRowClick?: (row: any) => void,
 *   selectable?: boolean, selectedIds?: (string|number)[], onSelectionChange?: (ids: (string|number)[]) => void,
 * }} props
 */
export function DataTable({
  columns,
  rows,
  rowKey = (row) => row.id,
  isLoading = false,
  isError = false,
  onRetry,
  emptyTitle = "No results",
  emptyDescription,
  onRowClick,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
}) {
  if (isLoading) return <LoadingRows />;
  if (isError) return <ErrorState onRetry={onRetry} />;
  if (!rows?.length) return <EmptyState title={emptyTitle} description={emptyDescription} />;

  const selectedSet = new Set(selectedIds);
  const pageIds = rows.map(rowKey);
  const allOnPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedSet.has(id));
  const someOnPageSelected = pageIds.some((id) => selectedSet.has(id));

  const toggleRow = (id) => {
    const next = new Set(selectedSet);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange?.(Array.from(next));
  };

  const toggleAllOnPage = () => {
    const next = new Set(selectedSet);
    if (allOnPageSelected) {
      pageIds.forEach((id) => next.delete(id));
    } else {
      pageIds.forEach((id) => next.add(id));
    }
    onSelectionChange?.(Array.from(next));
  };

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            {selectable && (
              <TableHead className="w-10">
                <Checkbox
                  checked={allOnPageSelected ? true : someOnPageSelected ? "indeterminate" : false}
                  onCheckedChange={toggleAllOnPage}
                  aria-label="Select all on this page"
                />
              </TableHead>
            )}
            {columns.map((col) => (
              <TableHead key={col.key} className={col.className}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const id = rowKey(row);
            return (
              <TableRow
                key={id}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(onRowClick && "cursor-pointer")}
                data-state={selectable && selectedSet.has(id) ? "selected" : undefined}
              >
                {selectable && (
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedSet.has(id)}
                      onCheckedChange={() => toggleRow(id)}
                      aria-label="Select row"
                    />
                  </TableCell>
                )}
                {columns.map((col) => (
                  <TableCell key={col.key} className={col.className}>
                    {col.render ? col.render(row) : row[col.key]}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
