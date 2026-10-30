// 组件内小标题 + 描述 + 「了解更多」 — spec: references/section-header.md.
// `data-ui` / `data-ui-part` are what scripts/verify.sh measures; keep them.
import type { ReactNode } from "react";

import { cn } from "./cn";

export function SectionHeader({
  title,
  desc,
  more,
  actions,
  className,
}: {
  title: string;
  /** One line; leave it out rather than restating the title. */
  desc?: ReactNode;
  /** 「了解更多」: where it goes. Opens in a new tab when external. */
  more?: { href: string; label?: string };
  /** Right-hand controls (hint text, toggles, buttons). */
  actions?: ReactNode;
  className?: string;
}) {
  const external = more && /^https?:/.test(more.href);
  return (
    <div data-ui="section-header" className={cn("flex min-h-8 flex-wrap items-center justify-between gap-4", className)}>
      <div className="flex min-w-0 items-center">
        <h3 data-ui-part="title" className="h-8 shrink-0 text-base leading-8 font-semibold text-black">
          {title}
        </h3>
        {(desc || more) && (
          <div data-ui-part="tip" className="ml-2 min-w-0 truncate text-xs leading-[1.15] text-[#93969d]">
            {desc && (
              <span data-ui-part="desc">
                {desc}
              </span>
            )}
            {more && (
              <a
                data-ui-part="link"
                href={more.href}
                {...(external && { target: "_blank", rel: "noreferrer" })}
                className="ml-3 cursor-pointer text-[#0057ff] no-underline hover:opacity-80"
              >
                {more.label ?? "了解更多"}
              </a>
            )}
          </div>
        )}
      </div>
      {actions && <div className="flex max-w-full flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}
