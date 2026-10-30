import { Checkbox } from "@base-ui/react/checkbox";
import { Tooltip } from "@base-ui/react/tooltip";
import { Check, Maximize, Minimize, SlidersHorizontal } from "lucide-react";
import { useId, type ReactNode } from "react";

import { ControlButton } from "./ControlButton";
import { MetricCard, type MetricComparison } from "./MetricCard";
import { SectionHeader } from "./SectionHeader";
import type { TrendPoint } from "./TrendChart";

export type OverviewMetric = {
  id: string;
  label: string;
  value: string;
  tail?: string;
  points: TrendPoint[];
  comparison?: MetricComparison;
};

/** references/metrics.md — expand additional rows in place, preserving the surrounding page. */
export function MetricOverview({ metrics, compare, onCompareChange, expanded, onExpandedChange, onConfigure, title = "数据概览", description, more, actions }: {
  metrics: OverviewMetric[];
  compare: boolean;
  onCompareChange: (compare: boolean) => void;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  onConfigure: () => void;
  title?: string;
  description?: string;
  more?: { href: string; label?: string };
  actions?: ReactNode;
}) {
  const gridId = useId();
  const visible = expanded ? metrics : metrics.slice(0, 5);
  const toggleLabel = expanded ? "收起" : "展开";
  return (
    <section data-ui="metric-overview" data-expanded={expanded}>
      <SectionHeader title={title} desc={description} more={more} actions={<>
        {actions}
        <label data-ui-part="compare-control" className="inline-flex cursor-pointer items-center gap-2 text-sm leading-[22px] text-[#31343b]">
          <Checkbox.Root checked={compare} onCheckedChange={onCompareChange} data-ui-part="compare-checkbox" className="grid size-4 shrink-0 place-items-center rounded border border-[#c5c7cc] bg-white text-white outline-offset-2 focus-visible:outline-2 focus-visible:outline-[#0057ff] data-checked:border-[#38374f] data-checked:bg-[#38374f]">
            <Checkbox.Indicator><Check aria-hidden className="size-3.5" /></Checkbox.Indicator>
          </Checkbox.Root>
          展示数据环比
        </label>
        <Tooltip.Root>
          <Tooltip.Trigger render={<ControlButton variant="icon" data-action="configure-metrics" aria-label="自定义指标" icon={<SlidersHorizontal />} onClick={onConfigure} />} />
          <Tooltip.Portal><Tooltip.Positioner side="top" sideOffset={8}><Tooltip.Popup className="rounded-xl bg-[rgba(50,51,53,0.95)] px-4 py-2 text-xs leading-[18px] text-white shadow-[0_3px_9px_rgba(0,0,0,0.08)]">自定义指标</Tooltip.Popup></Tooltip.Positioner></Tooltip.Portal>
        </Tooltip.Root>
        <Tooltip.Root>
          <Tooltip.Trigger render={<ControlButton variant="icon" className="hover:bg-[#f5f7fa]" data-action="toggle-metrics" aria-label={toggleLabel} aria-expanded={expanded} aria-controls={gridId} disabled={metrics.length <= 5} icon={expanded ? <Minimize /> : <Maximize />} onClick={() => onExpandedChange(!expanded)} />} />
          <Tooltip.Portal><Tooltip.Positioner side="top" sideOffset={8}><Tooltip.Popup data-ui="metric-toggle-tooltip" className="rounded-xl bg-[rgba(50,51,53,0.95)] px-4 py-2 text-xs leading-[18px] text-white shadow-[0_3px_9px_rgba(0,0,0,0.08)]">{toggleLabel}</Tooltip.Popup></Tooltip.Positioner></Tooltip.Portal>
        </Tooltip.Root>
      </>} />
      <div id={gridId} data-ui-part="grid" className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {visible.map((metric) => <MetricCard key={metric.id} {...metric} comparison={compare ? metric.comparison ?? { percent: null } : undefined} />)}
      </div>
      {!metrics.length && <p className="py-8 text-center text-sm text-[#93969d]">暂无指标</p>}
    </section>
  );
}
