import type { ButtonHTMLAttributes, ReactNode } from "react";

import { ControlButton } from "./ControlButton";

/** references/controls.md — white stroke action button modeled after OceanEngine "共享管理" */
export function OutlineButton({
  children,
  icon,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
}) {
  return (
    <ControlButton variant="outline" icon={icon} className={className} {...props}>
      {children}
    </ControlButton>
  );
}
