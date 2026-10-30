import { Checkbox } from "@base-ui/react/checkbox";
import { Popover } from "@base-ui/react/popover";
import { Select } from "@base-ui/react/select";
import { Check, ChevronDown, CircleX, Minus, X } from "lucide-react";
import { useRef, useState } from "react";
import type { ReactNode } from "react";

import { cn } from "./cn";

export type FilterOption = { value: string; label: string; disabled?: boolean };
export const filterSurface = "h-8 max-w-full rounded-lg border border-transparent bg-[#f2f4f7] text-sm leading-[22px] font-normal text-[#31343b] hover:bg-[#e8eaed] focus-visible:border-[#0057ff] focus-visible:shadow-[0_0_0_2px_rgba(0,87,255,0.2)] has-[:focus-visible]:border-[#0057ff] has-[:focus-visible]:shadow-[0_0_0_2px_rgba(0,87,255,0.2)]";
export const filterPopup = "z-50 max-w-[calc(100vw-32px)] overflow-hidden rounded-lg bg-white text-sm leading-[22px] font-normal text-[#31343b] shadow-[0_3px_9px_rgba(0,0,0,0.08)] outline-none";

/** references/filters.md — single choice closes on selection; the caller supplies “全部”. */
export function FilterSelect({ label, value, options, onChange, className }: {
  label: string;
  value: string;
  options: readonly FilterOption[];
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <Select.Root value={value} items={options} onValueChange={(next) => { if (next !== null) onChange(next); }}>
      <Select.Trigger aria-label={label} data-ui="filter-select" data-ui-part="trigger" className={cn(filterSurface, "flex w-[208px] cursor-pointer items-center px-2 py-1 text-left data-popup-open:border-[#0057ff] data-popup-open:bg-[#e8eaed] data-popup-open:shadow-[0_0_0_2px_rgba(0,87,255,0.2)]", className)}>
        <span className="shrink-0">{label}：</span>
        <Select.Value data-ui-part="value" className="min-w-0 flex-1 truncate" />
        <Select.Icon><ChevronDown aria-hidden className="size-3.5 text-[#93969d] in-data-popup-open:rotate-180" /></Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner align="start" sideOffset={4} collisionPadding={16} alignItemWithTrigger={false} className="z-50">
          <Select.Popup data-ui="filter-select-popup" aria-label={label} className={cn(filterPopup, "w-[var(--anchor-width)]")}>
            <Select.List data-ui-part="list" className="max-h-[min(190px,var(--available-height))] overflow-y-auto overscroll-contain py-1.5">
              {options.map((option) => (
                <Select.Item key={option.value} value={option.value} disabled={option.disabled} data-ui-part="option" data-option-id={option.value} className="cursor-pointer px-3 py-1.5 text-sm leading-[22px] text-[#31343b] outline-none hover:bg-[#f2f4f7] data-highlighted:focus-visible:bg-[#f2f4f7] data-selected:text-[#0057ff] data-disabled:cursor-not-allowed data-disabled:opacity-40">
                  <Select.ItemText>{option.label}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}

/** Shared trigger: chip actions are siblings of the trigger button, never nested controls. */
export function MultiFilterTrigger({ label, selected, open, onRemove, onClear, placeholder = "请选择", className }: {
  label: string;
  selected: readonly FilterOption[];
  open: boolean;
  onRemove: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
  className?: string;
}) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const first = selected[0];
  function restoreFocus() { requestAnimationFrame(() => triggerRef.current?.focus({ preventScroll: true })); }
  return (
    <div data-ui-part="trigger" data-open={open} className={cn(filterSurface, "group relative w-[240px] px-2", first ? "py-[3px]" : "py-1", open && "border-[#0057ff] bg-[#e8eaed] shadow-[0_0_0_2px_rgba(0,87,255,0.2)]", className)}>
      <Popover.Trigger ref={triggerRef} aria-label={`${label}：${selected.map((option) => option.label).join("、") || placeholder}`} className="absolute inset-0 cursor-pointer rounded-lg outline-none" />
      <div className="pointer-events-none relative flex h-full min-w-0 items-center gap-1">
        <span className="shrink-0">{label}：</span>
        {first ? <span data-ui-part="tag" title={selected.map((option) => option.label).join("、")} className="flex h-6 min-w-0 items-center rounded border border-[#dfe0e2] bg-white px-2 text-xs leading-[22px] text-[#31343b]">
          <span className="truncate">{first.label}</span>
          <button type="button" data-ui-part="remove" aria-label={`移除${first.label}`} onClick={() => { onRemove(first.value); restoreFocus(); }} className="pointer-events-auto ml-1 grid size-3.5 shrink-0 cursor-pointer place-items-center rounded text-[#93969d] hover:text-[#31343b] focus-visible:outline-2 focus-visible:outline-[#0057ff]"><X aria-hidden className="size-3.5" /></button>
        </span> : <span data-ui-part="placeholder" className="min-w-0 flex-1 truncate text-[#93969d]">{placeholder}</span>}
        <span className="flex-1" />
        {!!selected.length && !open && <span data-ui-part="count" aria-hidden className="h-[26px] shrink-0 rounded-[13px] bg-white px-2 py-px text-sm leading-[22px]">{selected.length}</span>}
        <ChevronDown aria-hidden className={cn("size-3.5 shrink-0 text-[#93969d]", open && "rotate-180")} />
      </div>
      {!!selected.length && <button type="button" data-ui-part="clear" aria-label={`清空${label}`} onClick={() => { onClear(); restoreFocus(); }} className="pointer-events-none absolute top-1/2 right-1.5 grid size-[18px] -translate-y-1/2 cursor-pointer place-items-center rounded bg-[#e8eaed] text-[#93969d] opacity-0 group-hover:pointer-events-auto group-hover:opacity-100 focus-visible:pointer-events-auto focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-[#0057ff]"><CircleX aria-hidden className="size-3.5" /></button>}
    </div>
  );
}

export function FilterCheckbox({ checked, indeterminate = false, disabled = false, onChange, label }: {
  checked: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <Checkbox.Root aria-label={label} checked={checked} indeterminate={indeterminate} disabled={disabled} onCheckedChange={onChange} data-ui-part="checkbox" className="grid size-4 shrink-0 cursor-pointer place-items-center rounded border border-[#b9bcc3] bg-white data-checked:border-[#31343b] data-checked:bg-[#31343b] data-checked:text-white data-indeterminate:border-[#31343b] data-indeterminate:bg-[#31343b] data-indeterminate:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0057ff] data-disabled:cursor-not-allowed data-disabled:opacity-40">
      <Checkbox.Indicator>{indeterminate ? <Minus aria-hidden className="size-3" /> : <Check aria-hidden className="size-3" strokeWidth={3} />}</Checkbox.Indicator>
    </Checkbox.Root>
  );
}

export function FilterCheckRow({ children, checked, indeterminate, disabled, onChange, id, label, className }: {
  children: ReactNode;
  checked: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
  id: string;
  label?: string;
  className?: string;
}) {
  return (
    <label data-ui-part="option" data-option-id={id} className={cn("flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm leading-[22px] text-[#31343b] hover:bg-[#f2f4f7] has-[:focus-visible]:bg-[#f2f4f7]", disabled && "cursor-not-allowed opacity-40", className)}>
      <FilterCheckbox checked={checked} indeterminate={indeterminate} disabled={disabled} onChange={onChange} label={label ?? (typeof children === "string" ? children : id)} />
      <span className="min-w-0 truncate" title={label ?? (typeof children === "string" ? children : undefined)}>{children}</span>
    </label>
  );
}

/** references/filters.md — immediate multi-selection, indeterminate “全选”, no confirm footer. */
export function MultiFilterSelect({ label, value, options, onChange, className }: {
  label: string;
  value: readonly string[];
  options: readonly FilterOption[];
  onChange: (value: string[]) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.filter((option) => value.includes(option.value));
  const enabled = options.filter((option) => !option.disabled);
  const count = enabled.filter((option) => value.includes(option.value)).length;
  function toggle(ids: readonly string[], checked: boolean) {
    const next = new Set(selected.map((option) => option.value));
    ids.forEach((id) => { if (checked) next.add(id); else next.delete(id); });
    onChange(options.filter((option) => next.has(option.value)).map((option) => option.value));
  }
  return (
    <div data-ui="multi-filter-select" className="max-w-full">
      <Popover.Root open={open} onOpenChange={setOpen}>
        <MultiFilterTrigger label={label} selected={selected} open={open} onRemove={(id) => toggle([id], false)} onClear={() => onChange([])} className={className} />
        <Popover.Portal>
          <Popover.Positioner align="start" sideOffset={4} collisionPadding={16} className="z-50">
            <Popover.Popup data-ui="multi-filter-popup" aria-label={label} className={cn(filterPopup, "w-[240px]")}>
              <div data-ui-part="list" role="group" aria-label={label} className="max-h-[min(202px,var(--available-height))] overflow-y-auto overscroll-contain py-1.5">
                <FilterCheckRow id="all" checked={enabled.length > 0 && count === enabled.length} indeterminate={count > 0 && count < enabled.length} disabled={!enabled.length} onChange={(checked) => toggle(enabled.map((option) => option.value), checked)}>全选</FilterCheckRow>
                {options.map((option) => <FilterCheckRow key={option.value} id={option.value} checked={value.includes(option.value)} disabled={option.disabled} onChange={(checked) => toggle([option.value], checked)}>{option.label}</FilterCheckRow>)}
                {!options.length && <p className="px-3 py-6 text-center text-[#93969d]">暂无选项</p>}
              </div>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
