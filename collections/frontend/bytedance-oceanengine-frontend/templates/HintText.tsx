// 带说明的虚线文字 + 悬停说明弹层 — spec: references/section-header.md.
// `data-ui` / `data-ui-part` are what scripts/verify.sh measures; keep them.
import { Tooltip } from "@base-ui/react/tooltip";
import type { ReactNode } from "react";

import { cn } from "./cn";

export function HintText({ children, hint, className }: { children: ReactNode; hint: ReactNode; className?: string }) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        delay={100}
        render={<span />}
        data-ui="hint-text"
        data-ui-part="hint"
        className={cn("cursor-pointer text-xs leading-[18px] text-[#93969d]", className)}
      >
        <span data-ui-part="text" className="border-b border-dashed border-current font-bold">
          {children}
        </span>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Positioner side="top" sideOffset={8} className="z-50">
          <Tooltip.Popup
            data-ui="hint-popover"
            data-ui-part="popover"
            className={cn(
              "w-80 rounded-xl bg-white p-4 text-xs leading-[18px] text-[#31343b] shadow-[0_3px_9px_rgba(0,0,0,0.08)]",
              "origin-(--transform-origin) transition-[opacity,scale] duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0",
            )}
          >
            <span data-ui-part="text">{hint}</span>
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
