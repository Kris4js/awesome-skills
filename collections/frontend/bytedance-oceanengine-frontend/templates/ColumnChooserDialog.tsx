import { Checkbox } from "@base-ui/react/checkbox";
import { Dialog } from "@base-ui/react/dialog";
import { Reorder, useDragControls, useReducedMotion } from "framer-motion";
import { Check, Menu, Search, X } from "lucide-react";
import { useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

import { cn } from "./cn";

import { ControlButton } from "./ControlButton";

export type ColumnChooserOption = {
  id: string;
  label: string;
  category: string;
  required?: boolean;
};

export type ColumnChooserDialogProps = {
  open: boolean;
  value: readonly string[];
  options: readonly ColumnChooserOption[];
  defaultValue: readonly string[];
  max?: number;
  onApply: (value: string[]) => void;
  onOpenChange: (open: boolean) => void;
};

/** Keep known IDs in caller order, reserving room for required columns. */
function normalizeSelection(value: readonly string[], options: readonly ColumnChooserOption[], max: number): string[] {
  const known = new Set(options.map((option) => option.id));
  const required = new Set(options.filter((option) => option.required).map((option) => option.id));
  let remaining = Math.max(0, max - required.size);
  return [...new Set([...value, ...required])].filter((id) => known.has(id) && (required.has(id) || remaining-- > 0));
}

/** references/column-chooser.md — the caller owns applied IDs; each opening owns a fresh draft. */
export function ColumnChooserDialog({ open, onOpenChange, max = 20, ...props }: ColumnChooserDialogProps) {
  const limit = Number.isFinite(max) ? Math.max(1, Math.floor(max)) : 20;
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-[rgba(26,26,27,0.5)]" />
        <Dialog.Popup
          data-ui="column-chooser"
          data-ui-part="panel"
          className="fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-32px)] w-[1009px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl bg-white text-[#31343b] shadow-[0_3px_9px_rgba(0,0,0,0.08)] outline-none"
        >
          <header data-ui-part="title" className="relative shrink-0 px-6 pt-6 pb-5 text-base leading-[1.15] font-bold">
            <Dialog.Title>自定义列</Dialog.Title>
            <Dialog.Close aria-label="关闭自定义列" className="absolute top-4 right-4 grid size-8 cursor-pointer place-items-center rounded-lg text-[#93969d] hover:bg-[#f2f4f7] focus-visible:outline-2 focus-visible:outline-[#0057ff]"><X aria-hidden className="size-4" /></Dialog.Close>
          </header>
          <Dialog.Description className="sr-only">搜索并选择最多 {limit} 列。拖动已选列的手柄排序，也可在手柄上按上下方向键、Home 或 End。取消将放弃本次更改。</Dialog.Description>
          {/* Keep the popup mounted for Base UI's focus restoration; discard all draft state on close. */}
          {open && <ColumnChooserDraft {...props} max={limit} onOpenChange={onOpenChange} />}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ColumnChooserDraft({ value, options, defaultValue, max, onApply, onOpenChange }: Omit<ColumnChooserDialogProps, "open" | "max"> & { max: number }) {
  const [draft, setDraft] = useState(() => normalizeSelection(value, options, max));
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(options[0]?.category ?? "");
  const [announcement, setAnnouncement] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const selectedRef = useRef<HTMLOListElement>(null);
  const instructionsId = useId();
  const constraintId = useId();
  const optionsHeadingId = useId();
  const selectedHeadingId = useId();

  // Parent value changes do not overwrite an open draft; changed options/limits stay valid.
  const selectedIds = normalizeSelection(draft, options, max);
  const selectedSet = new Set(selectedIds);
  const optionsById = new Map(options.map((option) => [option.id, option]));
  const selectedOptions = selectedIds.flatMap((id) => {
    const option = optionsById.get(id);
    return option ? [option] : [];
  });
  const matching = options.filter((option) => `${option.label} ${option.id}`.toLowerCase().includes(query.trim().toLowerCase()));
  const categories = [...new Set(matching.map((option) => option.category))];
  const activeCategory = categories.includes(category) ? category : categories[0];
  const visibleOptions = matching.filter((option) => option.category === activeCategory);
  const atMax = selectedIds.length >= max;
  const requiredOverflow = options.filter((option) => option.required).length > max;
  const canApply = selectedIds.length > 0 && selectedIds.length <= max && !requiredOverflow;

  function toggleOption(option: ColumnChooserOption, checked: boolean) {
    if (option.required || (checked && atMax)) return;
    setDraft(checked ? [...selectedIds, option.id] : selectedIds.filter((id) => id !== option.id));
  }

  function removeOption(id: string) {
    if (optionsById.get(id)?.required) return;
    const index = selectedIds.indexOf(id);
    setDraft(selectedIds.filter((selectedId) => selectedId !== id));
    setAnnouncement(`已移除${optionsById.get(id)?.label ?? id}`);
    requestAnimationFrame(() => {
      const handles = selectedRef.current?.querySelectorAll<HTMLButtonElement>('[data-ui-part="drag-handle"]');
      const next = handles?.[Math.min(index, handles.length - 1)];
      (next ?? searchRef.current)?.focus({ preventScroll: true });
    });
  }

  function moveOption(id: string, target: number) {
    const index = selectedIds.indexOf(id);
    if (index < 0) return;
    const destination = Math.max(0, Math.min(selectedIds.length - 1, target));
    const next = selectedIds.filter((selectedId) => selectedId !== id);
    next.splice(destination, 0, id);
    setDraft(next);
    setAnnouncement(`${optionsById.get(id)?.label ?? id}，第 ${destination + 1} 项，共 ${next.length} 项`);
  }

  return (
    <>
      <div data-ui-part="body" className="mx-6 grid h-[532px] min-h-0 shrink grid-rows-[minmax(0,3fr)_minmax(0,2fr)] overflow-hidden rounded-lg border border-[#dee0e3] md:grid-cols-[minmax(0,1fr)_280px] md:grid-rows-1">
        <div className="flex min-h-0 min-w-0 flex-col overflow-hidden border-b border-[#dee0e3] md:border-b-0">
          <div data-ui-part="search" className="flex h-9 shrink-0 items-center gap-2 border-b border-[#dee0e3] px-2 py-1 text-sm leading-[22px] focus-within:ring-2 focus-within:ring-[#0057ff] focus-within:ring-inset">
            <Search aria-hidden className="size-4 shrink-0 text-[#93969d]" />
            <input ref={searchRef} type="search" aria-label="搜索列" placeholder="搜索列" value={query} onChange={(event) => setQuery(event.target.value)} className="h-full min-w-0 flex-1 bg-transparent text-sm leading-[22px] outline-none placeholder:text-[#93969d]" />
          </div>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row md:gap-2">
            <nav data-ui-part="menu" aria-label="列分类" className="flex shrink-0 overflow-x-auto overscroll-contain bg-[#f5f7fa] md:block md:w-[200px] md:overflow-x-hidden md:overflow-y-auto">
              {categories.map((name) => (
                <button
                  key={name}
                  type="button"
                  data-ui-part="category"
                  data-category={name}
                  data-state={name === activeCategory ? "active" : "inactive"}
                  aria-pressed={name === activeCategory}
                  onClick={() => setCategory(name)}
                  className={cn(
                    "relative flex h-8 shrink-0 cursor-pointer items-center px-4 text-left text-sm leading-[22px] whitespace-nowrap focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-[#0057ff] focus-visible:-outline-offset-2 md:w-full",
                    name === activeCategory && "font-bold text-[#0057ff] before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-[#0057ff]",
                  )}
                >
                  <span className="truncate">{name}</span>
                </button>
              ))}
            </nav>
            <section data-ui-part="options" aria-labelledby={optionsHeadingId} className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-4 md:border-r md:border-[#dee0e3]">
              <h2 id={optionsHeadingId} className="mb-3 text-sm leading-[22px] font-semibold">{activeCategory ?? "全部列"}</h2>
              <div className="grid grid-cols-1 gap-x-4 gap-y-2 pb-3 pl-3 sm:grid-cols-2">
                {visibleOptions.map((option) => {
                  const checked = selectedSet.has(option.id);
                  const disabled = Boolean(option.required || (!checked && atMax));
                  return (
                    <label key={option.id} data-ui-part="option" data-option-id={option.id} data-state={checked ? "checked" : "unchecked"} data-required={option.required || undefined} className={cn("flex min-w-0 items-start gap-2 text-sm leading-[22px]", disabled ? "cursor-not-allowed" : "cursor-pointer", !checked && disabled && "opacity-40")}>
                      <Checkbox.Root
                        data-ui-part="checkbox"
                        data-option-id={option.id}
                        data-state={checked ? "checked" : "unchecked"}
                        checked={checked}
                        disabled={disabled}
                        aria-describedby={disabled ? constraintId : undefined}
                        onCheckedChange={(next) => toggleOption(option, next)}
                        className="mt-[3px] grid size-4 shrink-0 place-items-center rounded border border-[#dee0e3] bg-white data-checked:border-[#38374f] data-checked:bg-[#38374f] data-checked:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0057ff]"
                      >
                        <Checkbox.Indicator><Check aria-hidden className="size-3" strokeWidth={3} /></Checkbox.Indicator>
                      </Checkbox.Root>
                      <span className="min-w-0 flex-1 break-words" title={option.label}>{option.label}{option.required && <span className="sr-only">（必选）</span>}</span>
                    </label>
                  );
                })}
              </div>
              {!visibleOptions.length && <p className="py-6 text-center text-sm leading-[22px] text-[#93969d]">暂无匹配列</p>}
            </section>
          </div>
        </div>
        <section data-ui-part="selected" aria-labelledby={selectedHeadingId} className="flex min-h-0 min-w-0 flex-col p-4 md:w-[280px]">
          <div className="flex h-[22px] shrink-0 items-center justify-between gap-2">
            <h2 id={selectedHeadingId} data-ui-part="selected-title" className="min-w-0 truncate text-sm leading-[22px] font-semibold">已选列 <span aria-live="polite" aria-atomic="true">（{selectedIds.length}/{max}）</span></h2>
            <ControlButton data-ui-part="reset" variant="link" className="h-[22px] text-xs leading-[18px]" onClick={() => { setDraft(normalizeSelection(defaultValue, options, max)); setAnnouncement("已恢复默认列及顺序"); }}>恢复默认</ControlButton>
          </div>
          <Reorder.Group as="ol" axis="y" ref={selectedRef} values={selectedIds} onReorder={setDraft} layoutScroll aria-label="已选列顺序" className="m-0 flex min-h-0 flex-1 list-none flex-col gap-2 overflow-y-auto overscroll-contain pt-4 pb-1">
            {selectedOptions.map((option, index) => (
              <SelectedColumnRow key={option.id} option={option} index={index} count={selectedIds.length} instructionsId={instructionsId} onMove={moveOption} onRemove={removeOption} onDragEnd={() => setAnnouncement(`${option.label}，第 ${index + 1} 项，共 ${selectedIds.length} 项`)} />
            ))}
          </Reorder.Group>
          {(!selectedIds.length || requiredOverflow) && <p id={constraintId} role={requiredOverflow ? "alert" : undefined} className="shrink-0 pt-2 text-xs leading-[18px] text-[#b42318]">{requiredOverflow ? "必选列数量超过上限" : "至少选择一列"}</p>}
          {selectedIds.length > 0 && !requiredOverflow && <p id={constraintId} className="sr-only">最多选择 {max} 列；必选列不能取消。</p>}
        </section>
      </div>
      <p id={instructionsId} className="sr-only">按向上或向下方向键移动一项，Home 移到第一项，End 移到最后一项。</p>
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">{announcement}</div>
      <footer data-ui-part="footer" className="flex shrink-0 flex-wrap justify-end gap-4 p-6">
        <Dialog.Close data-ui-part="cancel" render={<ControlButton variant="outline" className="w-[88px] border-[#dfe0e2]" />}>取消</Dialog.Close>
        <ControlButton data-ui-part="apply" variant="primary" className="w-[88px]" disabled={!canApply} aria-describedby={!canApply ? constraintId : undefined} onClick={() => { if (!canApply) return; onApply([...selectedIds]); onOpenChange(false); }}>确定</ControlButton>
      </footer>
    </>
  );
}

function SelectedColumnRow({ option, index, count, instructionsId, onMove, onRemove, onDragEnd }: {
  option: ColumnChooserOption;
  index: number;
  count: number;
  instructionsId: string;
  onMove: (id: string, target: number) => void;
  onRemove: (id: string) => void;
  onDragEnd: () => void;
}) {
  const controls = useDragControls();
  const reducedMotion = useReducedMotion();
  const rowRef = useRef<HTMLLIElement>(null);
  const handleRef = useRef<HTMLButtonElement>(null);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const targets: Record<string, number> = { ArrowUp: index - 1, ArrowDown: index + 1, Home: 0, End: count - 1 };
    const target = targets[event.key];
    if (target === undefined) return;
    event.preventDefault();
    onMove(option.id, target);
    requestAnimationFrame(() => {
      handleRef.current?.focus({ preventScroll: true });
      rowRef.current?.scrollIntoView({ block: "nearest" });
    });
  }

  return (
    <Reorder.Item
      as="li"
      ref={rowRef}
      value={option.id}
      data-ui-part="selected-row"
      data-row-id={option.id}
      data-option-id={option.id}
      data-state="checked"
      data-required={option.required || undefined}
      layout="position"
      dragListener={false}
      dragControls={controls}
      dragElastic={0}
      dragMomentum={false}
      onDragEnd={onDragEnd}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.15 }}
      className="relative flex h-7 shrink-0 items-center gap-2 rounded bg-[#f2f4f7] px-3 py-[3px] text-sm leading-[22px] font-normal"
    >
      <button ref={handleRef} type="button" data-ui-part="drag-handle" aria-label={`调整${option.label}的位置，第 ${index + 1} 项，共 ${count} 项`} aria-describedby={instructionsId} aria-keyshortcuts="ArrowUp ArrowDown Home End" onKeyDown={handleKeyDown} onPointerDown={(event) => { if (event.button !== 0 || !event.isPrimary) return; event.preventDefault(); event.currentTarget.focus({ preventScroll: true }); controls.start(event); }} className="grid size-4 shrink-0 touch-none cursor-grab place-items-center rounded text-[#93969d] select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0057ff] active:cursor-grabbing">
        <Menu aria-hidden className="size-4" />
      </button>
      <span data-ui-part="selected-label" className="min-w-0 flex-1 truncate" title={option.label}>{option.label}</span>
      <button type="button" data-ui-part="remove" aria-label={`移除${option.label}`} disabled={option.required} onClick={() => onRemove(option.id)} className="grid size-4 shrink-0 cursor-pointer place-items-center rounded text-[#93969d] hover:text-[#31343b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0057ff] disabled:cursor-not-allowed disabled:opacity-40">
        <X aria-hidden className="size-4" />
      </button>
    </Reorder.Item>
  );
}
