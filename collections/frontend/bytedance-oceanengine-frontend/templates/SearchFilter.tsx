import { Search } from "lucide-react";

import { cn } from "./cn";

/** references/controls.md — one joined input, optional selector, no doubled borders. */
export function SearchFilter({ query, onQueryChange, placeholder = "输入名称或 ID", scope, scopes, onScopeChange }: {
  query: string;
  onQueryChange: (query: string) => void;
  placeholder?: string;
  scope?: string;
  scopes?: { value: string; label: string }[];
  onScopeChange?: (scope: string) => void;
}) {
  return (
    <div data-ui="search-filter" data-ui-part="group" className="flex h-8 w-[340px] max-w-full items-center rounded-lg text-sm leading-[22px] text-[#31343b] focus-within:ring-1 focus-within:ring-[#0057ff]">
      {scopes && (
        <div data-ui-part="select" className="h-8 w-[110px] shrink-0 rounded-l-lg border border-transparent bg-[#f2f4f7] px-2 py-1">
          <select aria-label="搜索范围" value={scope} onChange={(e) => onScopeChange?.(e.target.value)} className="h-full w-full cursor-pointer bg-transparent outline-none">
            {scopes.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      )}
      <div data-ui-part="input" className={cn("flex h-8 min-w-0 flex-1 items-center border border-transparent bg-[#f2f4f7] px-2 py-1", scopes ? "rounded-r-lg" : "rounded-lg")}>
        <input aria-label={placeholder} value={query} onChange={(e) => onQueryChange(e.target.value)} placeholder={placeholder} className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[#93969d]" />
        <Search aria-hidden className="ml-2 size-3.5 shrink-0 text-[#93969d]" />
      </div>
    </div>
  );
}
