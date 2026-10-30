/// <reference types="react" />
/// <reference types="react-dom" />
import { Tooltip } from "@base-ui/react/tooltip";
import { BarChart3, Download, Filter, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";

import { ColumnChooserDialog } from "../templates/ColumnChooserDialog";
import { ControlButton } from "../templates/ControlButton";
import { DropdownButton } from "../templates/DropdownButton";
import { OutlineButton } from "../templates/OutlineButton";
import { DataTable, type DataColumn } from "../templates/DataTable";
import { HintText } from "../templates/HintText";
import { LineTabs } from "../templates/LineTabs";
import { MetricOverview } from "../templates/MetricOverview";
import { NoticeBanner } from "../templates/NoticeBanner";
import { ProductTabs } from "../templates/ProductTabs";
import { SearchFilter } from "../templates/SearchFilter";
import { SelectionDialog } from "../templates/SelectionDialog";
import { SurfaceLayout } from "../templates/SurfaceLayout";
import { defaultMetricIds, metrics, money, records, type Row } from "./fixtures";
import { MaterialFilters } from "./MaterialFilters";
import "./styles.css";

function Gallery() {
  const [product, setProduct] = useState("library");
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState("all");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{ key: string; direction: "asc" | "desc" }>({ key: "spend", direction: "desc" });
  const [dialog, setDialog] = useState(new URLSearchParams(location.search).get("dialog") === "1");
  const [compare, setCompare] = useState(false);
  const [notice, setNotice] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [chooser, setChooser] = useState<"metrics" | "table" | null>(null);
  const [metricIds, setMetricIds] = useState(defaultMetricIds);
  const [tableIds, setTableIds] = useState(["name", "status", "shared", "budget", "balance", "spend", "impressions"]);
  const selectedMetrics = metricIds.flatMap((id) => metrics.find((metric) => metric.id === id) ?? []);
  const rows = useMemo(() => {
    const filtered = records.filter((r) => `${r.name} ${r.id}`.includes(query));
    const key = sort.key === "balance" ? "balance" : "spend";
    return filtered.sort((a, b) => (a[key] - b[key]) * (sort.direction === "asc" ? 1 : -1));
  }, [query, sort]);
  const columns: DataColumn<Row>[] = [
    { key: "name", label: "工作区信息", render: (r) => <><p data-ui-part="text">{r.name}</p><p className="text-[#93969d]">ID：{r.id}</p></> },
    { key: "status", label: "状态", render: () => <span className="inline-flex items-center gap-1"><span className="size-1.5 rounded-full bg-[#00aa00]" />可用</span> },
    { key: "shared", label: "共享信息", render: () => "--" },
    { key: "budget", label: "每日预算", align: "right", render: () => <span className="text-[#93969d]">未设置</span> },
    { key: "balance", label: "总余额", align: "right", sortable: true, render: (r) => money(r.balance) },
    { key: "spend", label: "消耗", align: "right", sortable: true, render: (r) => money(r.spend) },
    { key: "impressions", label: "展示次数", align: "right", render: (r) => r.impressions.toLocaleString() },
  ];
  const download = () => {
    const csv = ["工作区,消耗", ...rows.map((r) => `${r.name},${r.spend}`)].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = "component-fixtures.csv"; a.click(); URL.revokeObjectURL(url);
  };
  return (
    <Tooltip.Provider>
      <SurfaceLayout
        title="组件预览"
        controls={
          <div className="flex items-center gap-2.5">
            <DropdownButton
              items={[
                { key: "upload", label: "上传视频", desc: "上传视频到当前组织" },
                { key: "import", label: "导入视频", desc: "将视频导入当前组织" },
              ]}
              onSelect={(key) => setSelected(key === "upload" ? "上传视频" : "导入视频")}
            >
              新建视频
            </DropdownButton>
            <OutlineButton onClick={() => setNotice((v: boolean) => !v)}>共享管理</OutlineButton>
            <ControlButton onClick={() => setDialog(true)}>选择组织或账户</ControlButton>
          </div>
        }
      >
        <div>
          <MetricOverview metrics={selectedMetrics} compare={compare} onCompareChange={setCompare} expanded={expanded} onExpandedChange={setExpanded} onConfigure={() => setChooser("metrics")} description="按时间查看工作区的数据" more={{ href: "https://example.com/docs" }} actions={<HintText hint="数据概览和下方列表使用相同的筛选条件。趋势按小时展示，明细可通过数据视图查看。">当日指标说明</HintText>} />
          <div className="mt-6 border-b border-[#e6e8eb]"><LineTabs value={tab} onChange={setTab} items={[{ value: "all", label: "全部" }, { value: "active", label: "活跃" }]} /></div>
          <div className="my-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 max-w-full flex-wrap items-center gap-4"><SearchFilter query={query} onQueryChange={(q) => { setQuery(q); setPage(1); }} scope={scope} onScopeChange={setScope} scopes={[{ value: "all", label: "全部" }]} /><ControlButton icon={<Filter />} onClick={() => setNotice((v: boolean) => !v)}>更多筛选</ControlButton></div>
            <div className="flex gap-4"><ControlButton variant="icon" aria-label="下载数据" icon={<Download />} onClick={download} /><ControlButton variant="icon" aria-label="选择列" data-action="configure-columns" icon={<SlidersHorizontal />} onClick={() => setChooser("table")} /></div>
          </div>
          <DataTable columns={tableIds.flatMap((id: string) => columns.find((column) => column.key === id) ?? [])} rows={rows.slice((page - 1) * 10, page * 10)} rowKey={(r: Row) => r.id} summary={{ name: `合计（${rows.length}项）`, spend: money(rows.reduce((n: number, r: Row) => n + r.spend, 0)) }} sort={sort} onSort={(key: string) => setSort({ key, direction: sort.key === key && sort.direction === "desc" ? "asc" : "desc" })} total={rows.length} page={page} onPageChange={setPage} />
        </div>
        <div className="mt-8"><MaterialFilters /></div>
        <div className="mt-8"><ProductTabs value={product} onChange={setProduct} items={[{ value: "content", label: "内容", icon: <BarChart3 className="size-5" /> }, { value: "library", label: "素材库", icon: <BarChart3 className="size-5" /> }, { value: "analytics", label: "数据", icon: <BarChart3 className="size-5" /> }, { value: "settings", label: "设置", icon: <BarChart3 className="size-5" /> }]} /></div>
        {notice && <div className="mt-4"><NoticeBanner onDismiss={() => setNotice(false)}>组件预览数据用于检查样式和交互。{selected && ` 已选择 ${selected}`}{compare && " 已开启环比"}</NoticeBanner></div>}
        <SelectionDialog open={dialog} onOpenChange={setDialog} items={records.map((r: Row) => ({ id: r.id, name: r.name, kind: "account" }))} onSelect={(item: { id: string; name: string }) => setSelected(item.name)} />
        <ColumnChooserDialog open={chooser === "metrics"} onOpenChange={(open: boolean) => { if (!open) setChooser(null); }} value={metricIds} defaultValue={defaultMetricIds} options={metrics.map((metric: { id: string; label: string }) => ({ id: metric.id, label: metric.label, category: "基础效果" }))} onApply={setMetricIds} />
        <ColumnChooserDialog open={chooser === "table"} onOpenChange={(open: boolean) => { if (!open) setChooser(null); }} value={tableIds} defaultValue={columns.map((column) => column.key)} options={columns.map((column) => ({ id: column.key, label: column.label, category: ["name", "status", "shared"].includes(column.key) ? "账户信息" : "基础效果", required: column.key === "name" }))} onApply={setTableIds} />
      </SurfaceLayout>
    </Tooltip.Provider>
  );
}
createRoot(document.getElementById("root")!).render(<Gallery />);
