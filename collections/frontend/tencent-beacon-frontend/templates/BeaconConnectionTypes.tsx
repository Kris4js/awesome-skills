import { ChevronRight, Database } from 'lucide-react';
import mysql from '../assets/mysql.svg';
import starrocks from '../assets/starrocks.svg';
import pgsql from '../assets/postgresql.svg';
import clickhouse from '../assets/clickhouse.svg';

const connectionTypes = [
  { name: 'MySQL', description: '连接 MySQL 数据库，复用于多个数据集', icon: mysql },
  { name: 'StarRocks', description: '连接 StarRocks 高性能 OLAP 引擎', icon: starrocks },
  { name: 'PgSQL', description: '连接 PostgreSQL / PgSQL 数据库', icon: pgsql },
  { name: 'ClickHouse', description: '连接 ClickHouse 列式数据库', icon: clickhouse },
];

export function BeaconConnectionTypes({ onSelect }: { onSelect: (type: string) => void }) {
  return <section className="beacon-connection-page" aria-label="选择数据连接类型">
    <header className="beacon-connection-header"><Database className="beacon-type-header-icon" /><div><h2>新建数据连接</h2><span>选择要接入的数据库/数仓类型</span></div></header>
    <div className="beacon-connection-types"><div>
      <div className="beacon-type-group-title"><h3>数据库 / 数仓</h3><span>4 种</span></div>
      <div className="beacon-type-grid">{connectionTypes.map(type => <button key={type.name} type="button" aria-label={`选择 ${type.name}：${type.description}`} onClick={() => onSelect(type.name)}>
        <span className="beacon-type-icon"><img src={type.icon} alt="" width="20" height="20" /></span><span className="beacon-type-text"><span>{type.name}</span><span>{type.description}</span></span><ChevronRight />
      </button>)}</div>
    </div></div>
  </section>;
}
