import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "./cn";

/** references/controls.md — use the app's existing button primitive when integrating. */
export function ControlButton({
  variant = "filled",
  icon,
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "filled" | "primary" | "outline" | "icon" | "link";
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      data-ui={`button-${variant === "outline" ? "outline" : variant}`}
      data-ui-part="button"
      {...props}
      className={cn(
        "inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1 rounded-lg border px-4 py-1 text-sm leading-[22px] font-normal",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0057ff] disabled:cursor-not-allowed disabled:opacity-40",
        variant === "filled" && "border-[#f2f4f7] bg-[#f2f4f7] text-[#31343b] hover:bg-[#e8ebf0]",
        variant === "primary" && "border-[#0057ff] bg-[#0057ff] text-white hover:bg-[#004be0]",
        variant === "outline" && "border-[#dfe0e2] bg-white text-[#31343b] hover:bg-[#f2f4f7]",
        variant === "icon" && "w-8 border-[#f2f4f7] bg-[#f2f4f7] px-0 text-[#31343b] hover:bg-[#e8ebf0]",
        variant === "link" && "h-auto rounded-none border-0 bg-transparent p-0 text-[#0057ff] no-underline",
        className,
      )}
    >
      {icon && <span className="grid size-4 place-items-center [&>svg]:size-4">{icon}</span>}
      {children}
    </button>
  );
}
