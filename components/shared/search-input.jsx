"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";

/**
 * @param {{ value?: string, onSearch: (value: string) => void, placeholder?: string, delayMs?: number }} props
 */
export function SearchInput({ value = "", onSearch, placeholder = "Search…", delayMs = 300 }) {
  const [term, setTerm] = useState(value);
  const debounced = useDebouncedValue(term, delayMs);

  useEffect(() => {
    onSearch(debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <div className="relative w-full max-w-sm">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder={placeholder}
        className="pl-8"
      />
    </div>
  );
}
