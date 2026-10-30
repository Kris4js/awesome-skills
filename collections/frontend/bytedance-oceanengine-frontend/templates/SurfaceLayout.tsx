import type { ReactNode } from "react";

import { cn } from "./cn";

/** references/surfaces.md — generic geometry and CSS gradient; no external brand artwork. */
export function SurfaceLayout({ title, controls, children, className }: {
  title: ReactNode;
  controls?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div data-ui="page-background" data-ui-part="page" className={cn("min-h-screen bg-[linear-gradient(84deg,#f0f8ff_-73.41%,#e8f4ff_91.31%)] p-4 text-[#31343b] sm:p-6", className)}>
      <header data-ui-part="toolbar" className="mb-3 flex min-h-[58px] flex-wrap items-center justify-between gap-3 rounded-2xl bg-[rgba(255,255,255,0.4)] px-6">
        <h1 className="text-lg leading-[22px] font-semibold">{title}</h1>
        {controls}
      </header>
      <section data-ui-part="surface" className="min-w-0 rounded-xl bg-white p-4 sm:p-6">{children}</section>
    </div>
  );
}
