import { Popover } from "@base-ui/react/popover";

import { cn } from "./cn";

import { TrendChart, type TrendPoint } from "./TrendChart";

export type MetricComparison = { percent: number | null; previousPoints?: TrendPoint[]; currentLabel?: string; previousLabel?: string };

/** references/metrics.md — sparkline hover expands a trend; keyboard focus/click also works. */
export function MetricCard({ label, value, tail, points, comparison }: {
  label: string;
  value: string;
  tail?: string;
  points: TrendPoint[];
  comparison?: MetricComparison;
}) {
  const percent = comparison?.percent;
  const valid = typeof percent === "number" && Number.isFinite(percent);
  const change = valid ? `${percent > 0 ? "+" : ""}${percent.toFixed(2)}%` : "--";
  return (
    <div data-ui="metric-card" data-comparison={comparison !== undefined ? "on" : undefined} data-ui-part="card" className="group h-[84px] min-w-0 rounded-lg bg-[#f5f7fa] p-4 has-[[data-popup-open]]:bg-[rgba(42,85,229,0.06)]">
      <div data-ui-part="heading" className="mb-[10px] flex h-[18px] items-center justify-between gap-2">
        <span data-ui-part="label" className="truncate text-xs leading-[18px] font-bold text-[#31343b]">{label}</span>
        <Popover.Root>
          <Popover.Trigger
            openOnHover delay={100} closeDelay={150}
            aria-label={`查看${label}趋势`}
            className="cursor-pointer rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0057ff]"
          ><TrendChart points={points} label={label} mini /></Popover.Trigger>
          <Popover.Portal>
            <Popover.Positioner side="bottom" align="start" sideOffset={12} className="z-50">
              <Popover.Popup data-ui="trend-popover" data-ui-part="panel" className="w-[600px] max-w-[calc(100vw-32px)] rounded-xl bg-white text-xs leading-[18px] shadow-[0_3px_9px_rgba(0,0,0,0.08)] outline-none">
                <TrendChart points={points} label={label} previousPoints={comparison?.previousPoints} currentLabel={comparison?.currentLabel} previousLabel={comparison?.previousLabel} />
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>
      </div>
      <div className="flex h-6 items-baseline font-bold text-[#31343b]">
        <span data-ui-part="value" className="text-base leading-6">{value}</span>
        {tail && <span data-ui-part="decimal" className="text-xs leading-[18px]">{tail}</span>}
        {comparison !== undefined && <span data-ui-part="comparison" data-direction={valid ? percent > 0 ? "up" : percent < 0 ? "down" : "flat" : "unavailable"} aria-label={valid ? `环比${percent > 0 ? "上升" : percent < 0 ? "下降" : "持平"} ${Math.abs(percent).toFixed(2)}%` : "暂无环比数据"} className={cn("mb-px ml-2 text-xs leading-[18px]", valid && percent > 0 ? "text-[#e34949]" : valid && percent < 0 ? "text-[#0da600]" : "text-[#93969d]")}>{change}</span>}
      </div>
    </div>
  );
}
