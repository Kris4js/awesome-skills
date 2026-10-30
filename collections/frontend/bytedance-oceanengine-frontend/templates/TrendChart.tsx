import { LineChart } from "echarts/charts";
import { GridComponent, TooltipComponent } from "echarts/components";
import { init, use } from "echarts/core";
import { SVGRenderer } from "echarts/renderers";
import { useEffect, useRef } from "react";

use([LineChart, GridComponent, TooltipComponent, SVGRenderer]);
export type TrendPoint = { label: string; value: number | null };

/** references/metrics.md — compare periods of one metric on the same axis. */
export function TrendChart({ points, label, mini = false, color = "#0057ff", previousPoints, currentLabel = "本期", previousLabel = "上期" }: {
  points: TrendPoint[];
  label: string;
  mini?: boolean;
  color?: string;
  previousPoints?: TrendPoint[];
  currentLabel?: string;
  previousLabel?: string;
}) {
  const element = useRef<HTMLDivElement>(null);
  const comparing = !mini && previousPoints !== undefined;
  useEffect(() => {
    if (!element.current) return;
    const chart = init(element.current, undefined, { renderer: "svg" });
    const family = getComputedStyle(element.current).fontFamily;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const previous = new Map(previousPoints?.map((point) => [point.label, point.value]));
    const series = [{
      name: comparing ? currentLabel : label, type: "line" as const, data: points.map((p) => p.value), smooth: 0.3,
      connectNulls: false, showSymbol: false, symbolSize: 8,
      lineStyle: { color, width: mini ? 1.5 : 2 }, itemStyle: { color, borderColor: "#fff", borderWidth: 2 },
      endLabel: { show: comparing, formatter: currentLabel, color: "#62656c", fontSize: 11 },
      labelLayout: { moveOverlap: "shiftY" as const },
    }, ...(comparing ? [{
      name: previousLabel, type: "line" as const, data: points.map((p) => previous.get(p.label) ?? null), smooth: 0.3,
      connectNulls: false, showSymbol: false, symbolSize: 8,
      lineStyle: { color: "#8a8da3", width: 2, type: "dashed" as const }, itemStyle: { color: "#8a8da3", borderColor: "#fff", borderWidth: 2 },
      endLabel: { show: true, formatter: previousLabel, color: "#62656c", fontSize: 11 },
      labelLayout: { moveOverlap: "shiftY" as const },
    }] : [])];
    chart.setOption({
      animation: !reduced && !mini,
      textStyle: { fontFamily: family, fontSize: 12, color: "#93969d" },
      grid: mini ? { left: 1, right: 1, top: 1, bottom: 1 } : { left: 50, right: comparing ? 52 : 24, top: comparing ? 32 : 24, bottom: 32 },
      xAxis: {
        type: "category", data: points.map((p) => p.label), show: !mini, boundaryGap: false,
        axisLine: { show: false }, axisTick: { show: false },
        axisLabel: { color: "#93969d", fontSize: 12, hideOverlap: true },
      },
      yAxis: {
        type: "value", show: !mini, min: mini ? undefined : 0, splitNumber: 5,
        axisLine: { show: false }, axisTick: { show: false },
        axisLabel: { color: "#93969d", fontSize: 12 },
        splitLine: { lineStyle: { color: "#f0f1f3", width: 1, type: "solid" } },
      },
      tooltip: {
        show: !mini, trigger: "axis", renderMode: "richText", confine: true,
        axisPointer: { type: "line", lineStyle: { color: "#dee0e3", width: 1 } },
        backgroundColor: "#fff", borderWidth: 0, padding: [12, 16],
        textStyle: { color: "#31343b", fontSize: 12, fontFamily: family },
      },
      series,
    });
    const resize = new ResizeObserver(() => chart.resize());
    resize.observe(element.current);
    return () => { resize.disconnect(); chart.dispose(); };
  }, [points, label, mini, color, previousPoints, currentLabel, previousLabel, comparing]);

  const previous = new Map(previousPoints?.map((point) => [point.label, point.value]));
  return (
    <>
      <div className={mini ? undefined : "relative"}>
        {comparing && <ul aria-label="趋势图例" data-ui-part="legend" className="absolute top-2 left-[50px] z-10 flex max-w-[calc(100%-64px)] flex-wrap gap-x-3 text-xs leading-[18px] text-[#62656c]">
          <li className="inline-flex items-center gap-1"><span aria-hidden className="w-4 border-t-2" style={{ borderColor: color }} />{currentLabel}</li>
          <li className="inline-flex items-center gap-1"><span aria-hidden className="w-4 border-t-2 border-dashed border-[#8a8da3]" />{previousLabel}</li>
        </ul>}
        <div ref={element} role="img" aria-label={`${label}${comparing ? `，${currentLabel}与${previousLabel}对比` : ""}趋势`} data-ui-part={mini ? "sparkline" : "plot"} className={mini ? "h-4 w-20" : "h-[242px] w-[590px] max-w-full rounded-lg bg-white"} />
      </div>
      {!mini && (
        <details className="sr-only focus-within:not-sr-only">
          <summary>查看{label}数据</summary>
          <table><caption>{label}趋势数据</caption><thead><tr><th>时间</th><th>{comparing ? currentLabel : label}</th>{comparing && <th>{previousLabel}</th>}</tr></thead>
            <tbody>{points.map((p) => <tr key={p.label}><th>{p.label}</th><td>{p.value ?? "暂无数据"}</td>{comparing && <td>{previous.get(p.label) ?? "暂无数据"}</td>}</tr>)}</tbody>
          </table>
        </details>
      )}
    </>
  );
}
