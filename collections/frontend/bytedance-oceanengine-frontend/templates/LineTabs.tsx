// 默认标签页 — spec: references/tabs.md. Copy into the host project and adjust imports.
// `data-ui` / `data-ui-part` are what scripts/verify.sh measures; keep them.
import { useLayoutEffect, useRef, useState } from "react";

import { cn } from "./cn";

export function LineTabs<T extends string>({
  value,
  onChange,
  items,
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  items: { value: T; label: string; count?: number }[];
  className?: string;
}) {
  const list = useRef<HTMLDivElement>(null);
  const [bar, setBar] = useState({ left: 0, width: 0 });

  // The indicator is one element that slides to the selected tab, as wide as the tab.
  useLayoutEffect(() => {
    const el = list.current?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (el) setBar({ left: el.offsetLeft, width: el.offsetWidth });
  }, [value, items]);

  return (
    <div ref={list} role="tablist" data-ui="line-tabs" className={cn("relative flex overflow-x-auto", className)}>
      {items.map((item) => {
        const selected = item.value === value;
        return (
          <button
            key={item.value}
            role="tab"
            type="button"
            aria-selected={selected}
            data-ui-part={selected ? "tab-active" : "tab"}
            onClick={() => onChange(item.value)}
            className={cn(
              "mr-6 flex h-[30px] shrink-0 cursor-pointer items-center gap-1 py-1 text-sm leading-[22px] whitespace-nowrap last:mr-0",
              "focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-brand-200",
              selected ? "font-medium text-[#31343b]" : "text-[#62656c]",
            )}
          >
            {item.label}
            {item.count !== undefined && <span className="text-xs font-normal text-[#93969d]">{item.count}</span>}
          </button>
        );
      })}
      <span
        aria-hidden
        data-ui-part="indicator"
        className="absolute bottom-0 left-0 h-0.5 bg-[#0057ff] transition-transform duration-100 ease-in-out"
        style={{ width: bar.width, transform: `translateX(${bar.left}px)` }}
      />
    </div>
  );
}
