import { ChevronDown, ChevronLeft, ChevronRight, ChevronsUpDown, ChevronUp } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "./cn";

export type DataColumn<T> = { key: string; label: string; render: (row: T) => ReactNode; align?: "left" | "right"; sortable?: boolean };

/** references/data-table.md — caller owns sorting/pagination; no invented client totals. */
export function DataTable<T>({ columns, rows, rowKey, summary, sort, onSort, total, page, pageSize = 10, onPageChange }: {
  columns: DataColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  summary?: Record<string, ReactNode>;
  sort?: { key: string; direction: "asc" | "desc" };
  onSort?: (key: string) => void;
  total: number;
  page: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div data-ui="data-table" className="min-w-0 text-xs leading-[18px] text-[#31343b]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-separate border-spacing-0">
          <thead><tr>{columns.map((c) => <th data-ui-part="header" key={c.key} scope="col" aria-sort={sort?.key === c.key ? (sort.direction === "asc" ? "ascending" : "descending") : c.sortable ? "none" : undefined} className={cn("h-[42px] bg-[#f2f4f7] px-4 text-left font-bold", c.align === "right" && "text-right")}>
            {c.sortable ? <button type="button" onClick={() => onSort?.(c.key)} className="inline-flex cursor-pointer items-center gap-1"><span className="border-b border-dashed border-[#93969d]">{c.label}</span>{sort?.key === c.key ? (sort.direction === "asc" ? <ChevronUp className="size-3 text-[#0057ff]" /> : <ChevronDown className="size-3 text-[#0057ff]" />) : <ChevronsUpDown className="size-3 text-[#93969d]" />}</button> : c.label}
          </th>)}</tr></thead>
          <tbody>
            {summary && <tr>{columns.map((c) => <td data-ui-part="summary" key={c.key} className={cn("h-[42px] border-b border-[#dfe0e2] bg-white px-4 font-medium", c.align === "right" && "text-right tabular-nums")}>{summary[c.key]}</td>)}</tr>}
            {rows.map((row) => <tr data-ui-part="row" key={rowKey(row)} className="group">{columns.map((c) => <td data-ui-part="cell" key={c.key} className={cn("h-[53px] border-b border-[#dfe0e2] bg-white px-4 py-2 group-hover:bg-[#f2f5fd]", c.align === "right" && "text-right tabular-nums")}>{c.render(row)}</td>)}</tr>)}
          </tbody>
        </table>
        {!rows.length && <p className="py-12 text-center text-[#93969d]">暂无数据</p>}
      </div>
      <div data-ui-part="pagination" className="mt-4 flex h-6 items-center justify-end gap-2 text-sm text-[#62656c]">
        <span className="mr-1">共 {total} 条记录</span>
        <button aria-label="上一页" type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="grid size-6 cursor-pointer place-items-center rounded-lg bg-[#f2f4f7] disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft className="size-3" /></button>
        <span aria-current="page" className="grid h-6 min-w-6 place-items-center rounded-lg border border-[#0057ff] px-1 text-[#0057ff]">{page}</span>
        <button aria-label="下一页" type="button" disabled={page >= pages} onClick={() => onPageChange(page + 1)} className="grid size-6 cursor-pointer place-items-center rounded-lg bg-[#f2f4f7] disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight className="size-3" /></button>
        <span className="ml-2 rounded-lg bg-[#f2f4f7] px-2 py-0.5 text-xs">{pageSize}条/页</span>
      </div>
    </div>
  );
}
