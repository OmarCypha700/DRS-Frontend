/**
 * Horizontal magnitude bars — each row is directly labeled (name + value),
 * so the fill only needs one hue, not per-item identity color.
 * @param {{ items: any[], valueKey?: string, labelKey?: string, formatValue?: (v: number) => string }} props
 */
export function BarList({ items, valueKey = "count", labelKey = "label", formatValue = (v) => v }) {
  if (!items?.length) {
    return <p className="text-sm text-muted-foreground">No data for this period.</p>;
  }

  const max = Math.max(...items.map((item) => Number(item[valueKey])), 1);

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => {
        const value = Number(item[valueKey]);
        const pct = max > 0 ? (value / max) * 100 : 0;
        return (
          <div key={item[labelKey]} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-sm">
              <span>{item[labelKey]}</span>
              <span className="font-medium tabular-nums">{formatValue(value)}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
