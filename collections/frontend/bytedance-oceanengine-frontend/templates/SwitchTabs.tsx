import { Tabs } from "@base-ui/react/tabs";

import { cn } from "./cn";

/** references/tabs.md — joined tabs with a white, blue-outlined active item. */
export function SwitchTabs<T extends string>({ value, onChange, items, label, className }: {
  value: T;
  onChange: (value: T) => void;
  items: readonly { value: T; label: string; disabled?: boolean }[];
  label: string;
  className?: string;
}) {
  return (
    <Tabs.Root value={value} onValueChange={(next) => {
      const item = items.find((item) => item.value === next);
      if (item) onChange(item.value);
    }} className={cn("max-w-full overflow-x-auto", className)}>
      <Tabs.List aria-label={label} data-ui="switch-tabs" data-ui-part="strip" className="flex h-10 w-max items-start rounded">
        {items.map((item) => (
          <Tabs.Tab
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            data-ui-part={value === item.value ? "active" : "tab"}
            className="relative -mr-px flex h-8 shrink-0 cursor-pointer items-center bg-[#f2f4f7] px-4 py-[5px] text-sm leading-[22px] font-normal whitespace-nowrap text-[#31343b] first:rounded-l-lg last:mr-0 last:rounded-r-lg hover:bg-[#e8eaed] focus-visible:z-20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0057ff] data-active:z-10 data-active:bg-white data-active:text-[#0057ff] data-active:after:pointer-events-none data-active:after:absolute data-active:after:inset-0 data-active:after:rounded-[inherit] data-active:after:border data-active:after:border-[#0057ff] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {item.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>
    </Tabs.Root>
  );
}
