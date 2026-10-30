import { Menu } from "@base-ui/react/menu";
import { ChevronDown } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "./cn";

export type DropdownButtonItem = {
  key: string;
  label: string;
  desc?: string;
  icon?: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
};

/** references/controls.md — dropdown action button modeled after OceanEngine "新建视频" */
export function DropdownButton({
  variant = "primary",
  children,
  items,
  onSelect,
  disabled,
  className,
  popupClassName,
  ...props
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onSelect"> & {
  variant?: "primary" | "outline" | "filled";
  children: ReactNode;
  items: readonly DropdownButtonItem[];
  onSelect?: (key: string) => void;
  className?: string;
  popupClassName?: string;
}) {
  return (
    <div data-ui="button-dropdown" className="inline-block">
      <Menu.Root>
        <Menu.Trigger
          type="button"
          data-ui-part="button"
          disabled={disabled}
          {...props}
          className={cn(
            "group inline-flex h-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border px-4 py-1 text-sm leading-[22px] font-normal transition-colors",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0057ff] disabled:cursor-not-allowed disabled:opacity-40",
            variant === "primary" &&
              "border-[#0057ff] bg-[#0057ff] text-white hover:bg-[#004be0] data-popup-open:border-[#2e7bff] data-popup-open:bg-[#2e7bff]",
            variant === "outline" &&
              "border-[#dfe0e2] bg-white text-[#31343b] hover:bg-[#f2f4f7] data-popup-open:border-[#0057ff]",
            variant === "filled" &&
              "border-[#f2f4f7] bg-[#f2f4f7] text-[#31343b] hover:bg-[#e8ebf0] data-popup-open:bg-[#e8ebf0]",
            className,
          )}
        >
          <span data-ui-part="text" className="mr-1 block">
            {children}
          </span>
          <span data-ui-part="icon" className="inline-flex size-4 shrink-0 items-center justify-center">
            <ChevronDown
              aria-hidden
              className="size-4 transition-transform duration-200 in-data-popup-open:rotate-180"
            />
          </span>
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner side="bottom" align="start" sideOffset={4} className="z-50">
            <Menu.Popup
              data-ui="button-dropdown-popup"
              className={cn(
                "w-[220px] rounded-lg bg-white py-1.5 shadow-[0_3px_9px_rgba(0,0,0,0.08)] outline-none",
                popupClassName,
              )}
            >
              {items.map((item) => (
                <Menu.Item
                  key={item.key}
                  disabled={item.disabled}
                  data-ui-part="item"
                  onClick={() => {
                    item.onClick?.();
                    onSelect?.(item.key);
                  }}
                  className={cn(
                    "flex w-[220px] cursor-pointer flex-col justify-center px-3 py-1.5 text-left text-[#31343b] outline-none transition-colors",
                    "hover:bg-[#f2f4f7] focus-visible:bg-[#f2f4f7] data-highlighted:bg-[#f2f4f7]",
                    item.desc ? "h-[52px]" : "h-8",
                    item.disabled && "cursor-not-allowed opacity-40",
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    {item.icon && <span className="size-4 shrink-0">{item.icon}</span>}
                    <span data-ui-part="title" className="block text-sm leading-[22px] font-normal text-[#31343b]">
                      {item.label}
                    </span>
                  </div>
                  {item.desc && (
                    <span data-ui-part="desc" className="block text-xs leading-[18px] font-normal text-[#93969d]">
                      {item.desc}
                    </span>
                  )}
                </Menu.Item>
              ))}
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    </div>
  );
}
