export const sourceNames = ['全部', '本地文件', '腾讯文档', '飞书文档', '钉钉文档', 'MySQL', 'PgSQL', 'StarRocks', 'ClickHouse', 'SQL 视图'];
export const promptSuggestions = ['生成经营仪表盘', '分析收入变化', '定位业务异常', '核心品类贡献分析', '酒店取消率归因'];
export const modelNames = ['Auto', 'DeepSeek Flash', 'DeepSeek V4 Pro', '混元 4 Preview', 'GLM 5.3 Flash', 'GLM-5.3', 'MiniMax-M3', 'Kimi K3'];
export type Dataset = { id: string; name: string; source: string; columns: string[]; rows: string[][] };
export type DataConnection = { id: string; name: string; source: 'MySQL'; protocol: 'HTTP' | 'TCP'; host: string; port: string; database: string; description: string; administrators: string[] };

export function filterDatasets(datasets: Dataset[], query: string, source: string) {
  const normalized = query.trim().toLocaleLowerCase();
  return datasets.filter(dataset => (source === '全部' || dataset.source === source) && dataset.name.toLocaleLowerCase().includes(normalized));
}

export function createExampleDataset(name: string, source: string): Dataset {
  return {
    id: crypto.randomUUID(), name: name.trim(), source,
    columns: ['日期', '品类', '销售额', '订单数'],
    rows: [['2026-10-26', '家居', '12,800', '64'], ['2026-10-27', '数码', '24,600', '82'], ['2026-10-28', '家居', '16,400', '77']],
  };
}
