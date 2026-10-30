import { useState } from "react";

import { CascadingFilter, type FilterGroup } from "../templates/CascadingFilter";
import { FilterSelect, MultiFilterSelect } from "../templates/FilterSelect";
import { SwitchTabs } from "../templates/SwitchTabs";

const groups: FilterGroup[] = [
  { value: "basic", label: "基础组件", children: [{ value: "promotion", label: "推广卡片" }] },
  { value: "interaction", label: "互动组件", children: [{ value: "choice", label: "选择磁贴" }, { value: "vote", label: "投票磁贴" }, { value: "link", label: "指示链接" }] },
  { value: "display", label: "展示组件", children: [{ value: "image", label: "图片磁贴" }, { value: "coupon", label: "优惠券磁贴" }] },
];
const scopes = [{ value: "douyin", label: "抖音" }, { value: "toutiao", label: "头条" }, { value: "xigua", label: "西瓜" }, { value: "huoshan", label: "火山" }];
const statuses = [{ value: "all", label: "全部" }, { value: "pending", label: "审核中" }, { value: "approved", label: "审核通过" }, { value: "rejected", label: "审核拒绝" }];
const materials = [
  { id: "material-01", name: "产品推广入口", tab: "owned", type: "promotion", scope: "douyin", status: "approved" },
  { id: "material-02", name: "问卷互动卡", tab: "owned", type: "choice", scope: "toutiao", status: "pending" },
  { id: "material-03", name: "活动投票卡", tab: "owned", type: "vote", scope: "douyin", status: "rejected" },
  { id: "material-04", name: "产品图片卡", tab: "owned", type: "image", scope: "xigua", status: "approved" },
  { id: "material-05", name: "优惠券入口", tab: "owned", type: "coupon", scope: "huoshan", status: "pending" },
  { id: "material-06", name: "咨询链接", tab: "owned", type: "link", scope: "douyin", status: "approved" },
  { id: "material-07", name: "共享推广入口", tab: "shared", type: "promotion", scope: "douyin", status: "approved" },
  { id: "material-08", name: "共享互动卡", tab: "shared", type: "choice", scope: "xigua", status: "pending" },
];
const types = groups.flatMap((group) => group.children);

export function MaterialFilters() {
  const [tab, setTab] = useState("owned");
  const [type, setType] = useState<string[]>([]);
  const [scope, setScope] = useState<string[]>([]);
  const [status, setStatus] = useState("all");
  const rows = materials.filter((item) => item.tab === tab && (!type.length || type.includes(item.type)) && (!scope.length || scope.includes(item.scope)) && (status === "all" || item.status === status));
  return (
    <section aria-label="素材筛选" data-ui="material-filter-example" data-tab={tab}>
      <div data-ui="material-filters" data-ui-part="toolbar" className="flex min-w-0 flex-wrap items-center gap-4">
        <SwitchTabs label="素材归属" value={tab} onChange={(next) => { setTab(next); setType([]); setScope([]); setStatus("all"); }} items={[{ value: "owned", label: "归属组织的素材" }, { value: "shared", label: "共享给组织的素材" }]} />
        <CascadingFilter label="组件类型" value={type} onChange={setType} groups={groups} />
        <MultiFilterSelect label="适用范围" value={scope} onChange={setScope} options={scopes} />
        <FilterSelect label="审核状态" value={status} onChange={setStatus} options={statuses} />
      </div>
      <div className="mt-4 max-w-full overflow-x-auto rounded-lg">
        <table className="w-full min-w-[560px] border-collapse text-left text-sm leading-[22px] text-[#31343b]">
          <thead className="h-[42px] bg-[#f2f4f7] text-xs leading-[18px]"><tr>{["组件名称", "组件类型", "适用范围", "审核状态"].map((name) => <th key={name} className="px-4 font-semibold">{name}</th>)}</tr></thead>
          <tbody data-ui="material-results" aria-live="polite">
            {rows.map((item) => <tr key={item.id} data-row-id={item.id} className="h-14 border-b border-[#e6e8eb]"><td className="px-4">{item.name}</td><td className="px-4">{types.find((option) => option.value === item.type)?.label}</td><td className="px-4">{scopes.find((option) => option.value === item.scope)?.label}</td><td className="px-4">{statuses.find((option) => option.value === item.status)?.label}</td></tr>)}
            {!rows.length && <tr><td colSpan={4} className="py-8 text-center text-[#93969d]">暂无数据</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
