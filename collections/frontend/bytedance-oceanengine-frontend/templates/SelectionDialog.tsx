import { Dialog } from "@base-ui/react/dialog";
import { Building2, Folder, X } from "lucide-react";
import { useState } from "react";

import { ControlButton } from "./ControlButton";
import { LineTabs } from "./LineTabs";
import { NoticeBanner } from "./NoticeBanner";
import { SearchFilter } from "./SearchFilter";
import { SegmentedTabs } from "./SegmentedTabs";

export type SelectionItem = { id: string; name: string; kind: "organization" | "account" };

/** references/selection-dialog.md — layout only; caller owns loading, pagination, and selection. */
export function SelectionDialog({ open, onOpenChange, items, onSelect }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: SelectionItem[];
  onSelect: (item: SelectionItem) => void;
}) {
  const [kind, setKind] = useState<SelectionItem["kind"]>("account");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState(true);
  const matching = items.filter((i) => i.kind === kind && `${i.name} ${i.id}`.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-[rgba(26,26,27,0.5)]" />
        <Dialog.Popup data-ui="selection-dialog" data-ui-part="panel" className="fixed top-1/2 left-1/2 z-50 h-[700px] max-h-[calc(100dvh-32px)] w-[800px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-[0_3px_9px_rgba(0,0,0,0.08)] outline-none">
          <div data-ui-part="body" className="flex h-full min-h-0 flex-col px-6 pb-6">
            <header className="relative flex shrink-0 flex-wrap items-center justify-between gap-3 pt-5 pr-[52px] pb-6">
              <Dialog.Title data-ui-part="title" className="text-lg leading-[26px] font-semibold text-[#323335]">选择组织或账户</Dialog.Title>
              <SearchFilter query={query} onQueryChange={setQuery} placeholder="输入名称或 ID" />
              <Dialog.Close aria-label="关闭" className="absolute top-5 right-0 grid size-8 cursor-pointer place-items-center rounded-lg text-[#93969d] hover:bg-[#f2f4f7]"><X className="size-5" /></Dialog.Close>
            </header>
            <Dialog.Description className="sr-only">按组织或账户筛选并选择一个条目</Dialog.Description>
            {notice && <NoticeBanner onDismiss={() => setNotice(false)}>选择组织进入管理视图；选择账户进入对应工作区。可通过名称或 ID 搜索。</NoticeBanner>}
            <div className="mt-4 mb-2 shrink-0"><SegmentedTabs value={kind} onChange={setKind} label="选择类型" items={[{ value: "organization", label: "组织", icon: <Building2 /> }, { value: "account", label: "账户", icon: <Folder /> }]} /></div>
            <div className="mt-2 shrink-0"><LineTabs value="all" onChange={() => {}} items={[{ value: "all", label: "全部" }]} /></div>
            <div data-ui="selection-list" data-ui-part="list" className="min-h-0 flex-1 overflow-y-auto">
              {matching.map((item) => (
                <div key={item.id} data-ui-part="row" className="group flex h-[58px] shrink-0 items-center justify-between border-b border-[#dfe0e2] px-4 py-3 hover:bg-[rgba(242,245,253,0.79)] focus-within:bg-[rgba(242,245,253,0.79)]">
                  <div className="min-w-0 text-xs leading-[18px]">
                    <p data-ui-part="title" className="truncate text-[#323335]">{item.name}</p>
                    <p data-ui-part="description" className="text-[#93969d]">ID：{item.id}</p>
                  </div>
                  <ControlButton variant="primary" className="ml-3 shrink-0 opacity-0 focus-visible:opacity-100 group-hover:opacity-100 group-focus-within:opacity-100" onClick={() => { onSelect(item); onOpenChange(false); }}>选择</ControlButton>
                </div>
              ))}
              {!matching.length && <p className="py-12 text-center text-sm text-[#93969d]">暂无匹配结果</p>}
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
