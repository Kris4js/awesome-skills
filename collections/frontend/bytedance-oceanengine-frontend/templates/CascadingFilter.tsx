import { Popover } from "@base-ui/react/popover";
import { ChevronRight, Search, X } from "lucide-react";
import { useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

import { cn } from "./cn";

import { FilterCheckbox, FilterCheckRow, MultiFilterTrigger, filterPopup, type FilterOption } from "./FilterSelect";

export type FilterGroup = { value: string; label: string; children: readonly FilterOption[]; disabled?: boolean };

/** references/filters.md — two-level selection; values always contain leaf IDs. */
export function CascadingFilter({ label, value, groups, onChange, className }: {
  label: string;
  value: readonly string[];
  groups: readonly FilterGroup[];
  onChange: (value: string[]) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<string | null>(null);
  const columnsId = useId();
  const categoriesRef = useRef<HTMLDivElement>(null);
  const childrenRef = useRef<HTMLDivElement>(null);
  const options = groups.flatMap((group) => group.children.map((option) => ({ ...option, disabled: group.disabled || option.disabled })));
  const selected = options.filter((option) => value.includes(option.value));
  const enabled = options.filter((option) => !option.disabled);
  const current = groups.find((group) => group.value === active);
  const term = query.trim().toLocaleLowerCase();
  const results = groups.flatMap((group) => group.children
    .filter((option) => `${group.label}/${option.label}`.toLocaleLowerCase().includes(term))
    .map((option) => ({ ...option, disabled: group.disabled || option.disabled, path: `${group.label}/${option.label}` })));

  function state(ids: readonly string[]) {
    const count = ids.filter((id) => value.includes(id)).length;
    return { checked: ids.length > 0 && count === ids.length, indeterminate: count > 0 && count < ids.length, disabled: !ids.length };
  }
  function toggle(ids: readonly string[], checked: boolean) {
    const next = new Set(selected.map((option) => option.value));
    ids.forEach((id) => { if (checked) next.add(id); else next.delete(id); });
    onChange(options.filter((option) => next.has(option.value)).map((option) => option.value));
  }
  function showGroup(id: string, focusChild = false) {
    setActive(id);
    if (focusChild) requestAnimationFrame(() => childrenRef.current?.querySelector<HTMLElement>('[role="checkbox"]')?.focus());
  }
  function returnToCategory(event: KeyboardEvent) {
    if (event.key !== "ArrowLeft") return;
    event.preventDefault();
    categoriesRef.current?.querySelector<HTMLElement>('[aria-expanded="true"]')?.focus();
  }
  const currentIds = current?.children.filter((option) => !current.disabled && !option.disabled).map((option) => option.value) ?? [];
  return (
    <div data-ui="cascading-filter" className="max-w-full">
      <Popover.Root open={open} onOpenChange={(next) => { setOpen(next); if (!next) { setQuery(""); setActive(null); } }}>
        <MultiFilterTrigger label={label} selected={selected} open={open} onRemove={(id) => toggle([id], false)} onClear={() => onChange([])} className={className} />
        <Popover.Portal>
          <Popover.Positioner align="start" sideOffset={4} collisionPadding={16} className="z-50">
            <Popover.Popup data-ui="cascading-filter-popup" aria-label={label} className={cn(filterPopup, "[&_[role=checkbox][data-checked]]:border-[#38374f] [&_[role=checkbox][data-checked]]:bg-[#38374f] [&_[role=checkbox][data-indeterminate]]:border-[#38374f] [&_[role=checkbox][data-indeterminate]]:bg-[#38374f]", current || term ? "w-[400px]" : "w-[200px]")}>
              <div data-ui-part="search" className="border-b border-[#dee0e3] p-3">
                <div data-ui-part="input" className="flex h-8 items-center gap-1 rounded-lg border border-transparent bg-[#f2f4f7] px-2 py-1 text-sm leading-[22px] text-[#31343b]">
                  <Search aria-hidden className="size-3.5 shrink-0 text-[#93969d]" />
                  <input type="search" aria-label={`搜索${label}`} placeholder="请输入" value={query} onChange={(event) => setQuery(event.target.value)} className="h-full min-w-0 flex-1 bg-transparent text-sm leading-[22px] outline-none placeholder:text-[#93969d] focus-visible:underline [&::-webkit-search-cancel-button]:appearance-none" />
                  {query && <button type="button" aria-label="清空搜索" onClick={() => setQuery("")} className="grid size-3.5 shrink-0 cursor-pointer place-items-center rounded text-[#93969d] focus-visible:outline-2 focus-visible:outline-[#0057ff]"><X aria-hidden className="size-3.5" /></button>}
                </div>
              </div>
              {term ? <div data-ui-part="results" role="group" aria-label="搜索结果" className="max-h-[min(276px,calc(var(--available-height)-57px))] overflow-y-auto overscroll-contain py-1.5">
                {results.map((option) => <FilterCheckRow key={option.value} id={option.value} label={option.path} checked={value.includes(option.value)} disabled={option.disabled} onChange={(checked) => toggle([option.value], checked)}>
                  <span data-ui-part="label"><FilterMatch text={option.path} term={term} /></span>
                </FilterCheckRow>)}
                {!results.length && <p role="status" className="px-3 py-6 text-center text-[#93969d]">暂无匹配项</p>}
              </div> : <div data-ui-part="columns" className={cn("grid min-h-0 rounded-lg", current ? "grid-cols-2" : "grid-cols-1")}>
                <div ref={categoriesRef} data-ui-part="category" role="group" aria-label="分类" className="max-h-[min(276px,calc(var(--available-height)-57px))] min-w-0 overflow-y-auto overscroll-contain border-r border-[#dee0e3]">
                  <div data-ui-part="list" className="py-1.5">
                    <FilterCheckRow id="all" {...state(enabled.map((option) => option.value))} onChange={(checked) => toggle(enabled.map((option) => option.value), checked)}>全选</FilterCheckRow>
                    {groups.map((group) => {
                      const ids = group.children.filter((option) => !group.disabled && !option.disabled).map((option) => option.value);
                      return (
                        <div key={group.value} data-ui-part="category-row" data-category-id={group.value} data-active={active === group.value} className={cn("flex h-[34px] min-w-0 items-center gap-2 px-3 hover:bg-[#f2f4f7]", active === group.value && "font-bold")}>
                          <FilterCheckbox {...state(ids)} label={`全选${group.label}`} onChange={(checked) => toggle(ids, checked)} />
                          <button type="button" aria-expanded={active === group.value} aria-controls={active === group.value ? columnsId : undefined} onClick={() => showGroup(group.value)} onKeyDown={(event) => { if (event.key === "ArrowRight") { event.preventDefault(); showGroup(group.value, true); } }} className="flex h-full min-w-0 flex-1 cursor-pointer items-center justify-between gap-1 text-left text-sm leading-[22px] text-[#31343b] focus-visible:rounded focus-visible:outline-2 focus-visible:outline-[#0057ff]">
                            <span data-ui-part="label" className="min-w-0 truncate py-1.5" title={group.label}>{group.label}</span>
                            <ChevronRight aria-hidden className="size-4 shrink-0 text-[#93969d]" />
                          </button>
                        </div>
                      );
                    })}
                    {!groups.length && <p className="px-3 py-6 text-center text-[#93969d]">暂无选项</p>}
                  </div>
                </div>
                {current && <div ref={childrenRef} id={columnsId} data-ui-part="child" role="group" aria-label={current.label} onKeyDown={returnToCategory} className="max-h-[min(276px,calc(var(--available-height)-57px))] min-w-0 overflow-y-auto overscroll-contain py-1.5">
                  <FilterCheckRow id="group-all" {...state(currentIds)} onChange={(checked) => toggle(currentIds, checked)}>全选</FilterCheckRow>
                  {current.children.map((option) => <FilterCheckRow key={option.value} id={option.value} checked={value.includes(option.value)} disabled={current.disabled || option.disabled} onChange={(checked) => toggle([option.value], checked)}>{option.label}</FilterCheckRow>)}
                </div>}
              </div>}
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}

function FilterMatch({ text, term }: { text: string; term: string }) {
  const index = text.toLocaleLowerCase().indexOf(term);
  if (index < 0) return text;
  return <>{text.slice(0, index)}<em data-ui-part="match" className="text-[#0057ff] not-italic">{text.slice(index, index + term.length)}</em>{text.slice(index + term.length)}</>;
}
