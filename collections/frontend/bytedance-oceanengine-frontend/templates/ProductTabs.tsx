// 产品标签页 — spec: references/tabs.md. Copy into the host project and adjust imports.
// `data-ui` / `data-ui-part` are what scripts/verify.sh measures; keep them.
import type { ReactNode } from "react";

import { cn } from "./cn";

export type ProductTab<T extends string> = {
  value: T;
  label: string;
  /** 20×20; `active` is the colour version, `icon` the grey one. */
  icon?: ReactNode;
  activeIcon?: ReactNode;
};

export function ProductTabs<T extends string>({
  value,
  onChange,
  items,
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  items: ProductTab<T>[];
  className?: string;
}) {
  const at = items.findIndex((i) => i.value === value);
  return (
    <div
      role="tablist"
      data-ui="product-tabs"
      data-ui-part="strip"
      className={cn("flex h-[41px] overflow-x-auto rounded-t-2xl bg-[#f2f5fd]", className)}
    >
      {items.map((item, i) => {
        const selected = i === at;
        const divider = i > 0 && !selected && i - 1 !== at;
        return (
          <button
            key={item.value}
            role="tab"
            type="button"
            aria-selected={selected}
            data-ui-part={selected ? "tab-active" : "tab"}
            data-divider={divider || undefined}
            onClick={() => onChange(item.value)}
            className={cn(
              "relative flex h-[42px] shrink-0 cursor-pointer items-center gap-1 border px-4 py-2 text-base leading-6 whitespace-nowrap",
              "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-200",
              selected
                ? "rounded-t-2xl border-white border-b-transparent bg-white font-medium text-[#31343b]"
                : "border-transparent text-[#62656c]",
              // Divider between two unselected tabs: 1×14 #DEE0E3, centred on the shared edge.
              divider &&
                "before:absolute before:top-1/2 before:left-0 before:h-3.5 before:w-px before:-translate-y-1/2 before:bg-[#dee0e3]",
            )}
          >
            {item.icon && (
              <span data-ui-part="icon" className="grid size-5 place-items-center">
                {selected ? (item.activeIcon ?? item.icon) : item.icon}
              </span>
            )}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
