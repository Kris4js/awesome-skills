import { Info, X } from "lucide-react";
import type { ReactNode } from "react";

/** references/selection-dialog.md — only show information that changes the user's next action. */
export function NoticeBanner({ children, onDismiss }: { children: ReactNode; onDismiss?: () => void }) {
  return (
    <div role="status" data-ui="notice-banner" data-ui-part="banner" className="flex items-start gap-1 rounded-lg border border-[rgba(42,85,229,0.2)] bg-[#e8f4ff] px-4 py-2 text-sm leading-[normal] text-[#31343b]">
      <Info aria-hidden className="mt-0.5 size-3 shrink-0 fill-[#0057ff] text-white" />
      <div data-ui-part="text" className="min-w-0 flex-1 text-xs leading-[18px]">{children}</div>
      {onDismiss && <button type="button" aria-label="关闭提示" onClick={onDismiss} className="cursor-pointer rounded outline-offset-2"><X className="size-3.5" /></button>}
    </div>
  );
}
