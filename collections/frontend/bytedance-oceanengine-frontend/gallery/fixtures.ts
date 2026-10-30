import type { OverviewMetric } from "../templates/MetricOverview";
import type { TrendPoint } from "../templates/TrendChart";

// Synthetic component fixtures, unrelated to reference-site accounts or balances.
export const points: TrendPoint[] = [12, 3, 2, 1, 1, 4, 8, 20, 24, 56, 52, 62, 120, 100, 86, 84, 94, 56, 28, 105, 208, 176, 74].map((value, i) => ({ label: `${String(i).padStart(2, "0")}:00`, value }));
const previousPoints: TrendPoint[] = [10, 6, 3, 1, 2, 1, 3, 16, 45, 24, 58, 36, 12, 6, 62, 52, 48, 12, 22, 70, 96, 84, 60].map((value, i) => ({ label: `${String(i).padStart(2, "0")}:00`, value }));
const metricValues = [
  { id: "spend", label: "消耗", value: "1,357", tail: ".62", percent: 46.6 },
  { id: "impressions", label: "展示次数", value: "218,147", percent: -2.13 },
  { id: "cpm", label: "平均千次展现费用", value: "6", tail: ".22", percent: 12.8 },
  { id: "clicks", label: "点击次数", value: "12,580", percent: 22.38 },
  { id: "ctr", label: "点击率", value: "5", tail: ".77%", percent: -5.41 },
  { id: "coupon", label: "优惠券金额", value: "0", tail: ".00", percent: null },
  { id: "gross", label: "成交金额", value: "27,182", tail: ".00", percent: 21.73 },
  { id: "roi", label: "净成交 ROI", value: "10", tail: ".65", percent: 31.81 },
  { id: "net", label: "净成交金额", value: "18,323", tail: ".00", percent: 13.24 },
  { id: "orders", label: "净成交订单数", value: "35", percent: -5.41 },
  { id: "settled", label: "成交金额结算率", value: "67", tail: ".63%", percent: -12.85 },
  { id: "refund", label: "1 小时内退款率", value: "32", tail: ".37%", percent: 4.51 },
  { id: "subsidy", label: "平台补贴金额", value: "2,367", tail: ".99", percent: 51.73 },
  { id: "estimated", label: "未完结订单预估金额", value: "928", tail: ".00", percent: null },
];
export const metrics: OverviewMetric[] = metricValues.map(({ percent, ...metric }) => ({
  ...metric,
  points: metric.id === "coupon" ? points.map((p) => ({ ...p, value: 0 })) : points,
  comparison: { percent, previousPoints: metric.id === "coupon" ? previousPoints.map((p) => ({ ...p, value: 0 })) : previousPoints },
}));
export const defaultMetricIds = metrics.slice(0, 13).map((m) => m.id);

export type Row = { id: string; name: string; balance: number; spend: number; impressions: number };
export const records: Row[] = Array.from({ length: 12 }, (_, i) => ({ id: `fixture-${1000 + i}`, name: `工作区 ${String(i + 1).padStart(2, "0")}`, balance: 18400 - i * 815, spend: i < 2 ? 1150 - i * 920 : 0, impressions: i < 2 ? 172195 - i * 126243 : 0 }));
export const money = (value: number) => value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
