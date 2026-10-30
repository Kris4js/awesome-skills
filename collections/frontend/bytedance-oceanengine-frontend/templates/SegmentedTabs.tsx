import { Tabs } from "@base-ui/react/tabs";
import type { ReactNode } from "react";

/** references/selection-dialog.md — equal-width tabs on a grey track, white selected surface. */
export function SegmentedTabs<T extends string>({ value, onChange, items, label }: {
  value: T;
  onChange: (value: T) => void;
  items: { value: T; label: string; icon?: ReactNode }[];
  label: string;
}) {
  return (
    <Tabs.Root value={value} onValueChange={(v) => {
      const item = items.find((item) => item.value === v);
      if (item) onChange(item.value);
    }}>
      <Tabs.List aria-label={label} data-ui="segmented-tabs" data-ui-part="strip" className="flex h-[38px] gap-2 rounded-lg bg-[#f2f4f7] p-1">
        {items.map((item) => (
          <Tabs.Tab
            key={item.value}
            value={item.value}
            data-ui-part={value === item.value ? "active" : "tab"}
            className="flex h-[30px] min-w-0 flex-1 cursor-pointer items-center justify-center gap-1 rounded-lg px-4 py-1 text-sm leading-[22px] font-semibold whitespace-nowrap text-[#62656c] outline-offset-2 data-active:bg-white data-active:text-[#0057ff] data-active:shadow-[0_4px_8px_rgba(0,0,0,0.1)]"
          >
            {item.icon && <span className="grid size-4 place-items-center [&>svg]:size-4">{item.icon}</span>}
            {item.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>
    </Tabs.Root>
  );
}
