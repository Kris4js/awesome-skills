import { useMemo, useState } from 'react';
import { Database, FileText, FolderPlus, LayoutDashboard, Layers, Maximize2, Minimize2, Plus, Search, Table2, Trash2, Upload, X } from 'lucide-react';
import { WorkbenchMenu } from './WorkbenchMenu';
import { WorkbenchDialog } from './WorkbenchDialog';
import { BeaconConnectionForm } from './BeaconConnectionForm';
import { BeaconConnectionTypes } from './BeaconConnectionTypes';
import { createExampleDataset, filterDatasets, sourceNames, type Dataset, type DataConnection } from './data';
import emptyIllustration from '../assets/dataset-empty.svg';

export function BeaconDataWorkspace({ expanded, onExpand, onClose, initialConnectionForm = false }: { expanded: boolean; onExpand: () => void; onClose: () => void; initialConnectionForm?: boolean }) {
  const [tab, setTab] = useState(initialConnectionForm ? '数据连接' : '数据集');
  const [query, setQuery] = useState('');
  const [source, setSource] = useState('全部');
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [newSource, setNewSource] = useState('本地文件');
  const [info, setInfo] = useState('');
  const [connections, setConnections] = useState<DataConnection[]>([]);
  const [connectionId, setConnectionId] = useState<string>();
  const [connectionCreating, setConnectionCreating] = useState(initialConnectionForm);
  const selected = datasets.find(dataset => dataset.id === selectedId);
  const connection = connections.find(item => item.id === connectionId);
  const filteredConnections = connections.filter(item => (source === '全部' || item.source === source) && item.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  const startConnection = () => { setTab('数据连接'); setConnectionCreating(false); setConnectionId(undefined); };
  const filtered = useMemo(() => filterDatasets(datasets, query, source), [datasets, query, source]);
  const createOptions = [
    { label: '本地上传', icon: <Upload />, group: '数据接入' }, { label: '添加数据', icon: <Database />, group: '数据接入' },
    { label: '数据看板', icon: <LayoutDashboard />, group: '创建分析' }, { label: '分析画布', icon: <Layers />, disabled: true, group: '创建分析' },
    { label: '数据加工', icon: <Layers />, disabled: true, group: '创建分析' }, { label: '知识文档', icon: <FileText />, group: '创建分析' },
    { label: 'Excel 表格', icon: <Table2 />, group: '创建分析' }, { label: '文件夹', icon: <FolderPlus />, group: '文件' },
  ];
  return <section className="beacon-workspace beacon-surface" aria-label="数据工作区" data-ui="workspace">
    <div className="beacon-file-bar">
      <div className="beacon-file-tab"><Database /><span>添加数据</span><button className="beacon-icon-button" aria-label="关闭 添加数据" onClick={onClose}><X /></button></div>
      <WorkbenchMenu label="新建" chevron={false} options={createOptions} className="beacon-icon-button" onSelect={item => item === '添加数据' ? setTab('数据集') : item === '本地上传' ? setCreating(true) : setInfo(item)}><Plus /></WorkbenchMenu>
      <button className="beacon-icon-button beacon-expand" aria-label={expanded ? '退出铺满' : '铺满页面'} onClick={onExpand}>{expanded ? <Minimize2 /> : <Maximize2 />}</button>
    </div>
    <div className="beacon-data-tabs" role="tablist" aria-label="数据类型">
      {['数据集', '数据连接'].map(item => <button key={item} id={`tab-${item}`} role="tab" aria-selected={tab === item} aria-controls="beacon-data-panel" tabIndex={tab === item ? 0 : -1}
        onClick={() => setTab(item)} onKeyDown={event => { if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) { event.preventDefault(); const next = event.key === 'Home' ? '数据集' : event.key === 'End' ? '数据连接' : tab === '数据集' ? '数据连接' : '数据集'; setTab(next); document.getElementById(`tab-${next}`)?.focus(); } }}>{item}</button>)}
    </div>
    <div className="beacon-data-body" role="tabpanel" id="beacon-data-panel" aria-labelledby={`tab-${tab}`}>
      <div className="beacon-dataset-list">
        <div className="beacon-data-filters">
          <WorkbenchMenu label={`按数据来源筛选：${source}`} className="beacon-source" value={source} options={sourceNames.map(label => ({ label, icon: label === '全部' ? <Layers /> : <Database /> }))} onSelect={setSource}><Layers /><span>{source}</span></WorkbenchMenu>
          <label className="beacon-search"><Search /><input aria-label={tab === '数据集' ? '搜索数据集' : '搜索数据连接'} placeholder={tab === '数据集' ? '搜索数据集...' : '搜索数据连接...'} value={query} onChange={event => setQuery(event.target.value)} /></label>
        </div>
        <div className="beacon-dataset-items">
          {tab === '数据连接' ? <>
            {!filteredConnections.length ? <p className="beacon-list-empty">{connections.length ? '无匹配数据连接' : '暂无数据连接'}</p> : filteredConnections.map(item => <button className="beacon-dataset-item" key={item.id} aria-pressed={connectionId === item.id && !connectionCreating} onClick={() => { setConnectionId(item.id); setConnectionCreating(false); }}><Database /><span>{item.name}</span></button>)}
            <button className="beacon-new-connection-link" onClick={startConnection}>新建数据连接</button>
          </> : !filtered.length ? <p className="beacon-list-empty">{datasets.length ? '无匹配数据集' : '暂无数据集'}</p> : filtered.map(dataset =>
            <button key={dataset.id} className="beacon-dataset-item" aria-pressed={selectedId === dataset.id} onClick={() => setSelectedId(dataset.id)}><Table2 /><span>{dataset.name}</span></button>)}
        </div>
        <div className="beacon-list-count">共 {tab === '数据集' ? filtered.length : filteredConnections.length} 个{tab}</div>
      </div>
      <div className={`beacon-data-detail ${tab === '数据连接' && (connectionCreating || !connection) ? 'beacon-data-detail-form' : ''}`}>
        {tab === '数据连接' && connectionCreating ? <BeaconConnectionForm onCancel={() => setConnectionCreating(false)} onSubmit={draft => {
          const item: DataConnection = { id: crypto.randomUUID(), name: draft.name, source: 'MySQL', protocol: draft.protocol, host: draft.host, port: draft.port, database: draft.database, description: draft.description, administrators: draft.administrators };
          setConnections(previous => [...previous, item]); setConnectionId(item.id); setConnectionCreating(false); setQuery(''); setSource('全部');
        }} /> : tab === '数据连接' && connection ? <div className="beacon-dataset-preview" data-ui="connection-detail">
          <div className="beacon-detail-heading"><h2>{connection.name}</h2><button className="beacon-icon-button" aria-label="删除示例数据连接" onClick={() => { setConnections(connections.filter(item => item.id !== connection.id)); setConnectionId(undefined); }}><Trash2 /></button></div>
          <dl className="beacon-connection-summary"><dt>类型</dt><dd>MySQL</dd><dt>连接协议</dt><dd>{connection.protocol}</dd><dt>地址 Host</dt><dd>{connection.host}</dd><dt>端口号</dt><dd>{connection.port}</dd><dt>数据库</dt><dd>{connection.database}</dd>{connection.description && <><dt>描述</dt><dd>{connection.description}</dd></>}{!!connection.administrators.length && <><dt>管理员</dt><dd>{connection.administrators.join('，')}</dd></>}</dl>
          <p className="beacon-dialog-note">此连接仅用于本地预览，未建立真实数据库连接。</p>
        </div> : tab === '数据连接' ? <BeaconConnectionTypes onSelect={type => type === 'MySQL' ? setConnectionCreating(true) : setInfo(`${type} 表单尚未复刻`)} /> : tab === '数据集' && selected ? <div className="beacon-dataset-preview">
          <div className="beacon-detail-heading"><h2>{selected.name}</h2><button className="beacon-icon-button" aria-label="删除示例数据集" onClick={() => { setDatasets(datasets.filter(item => item.id !== selected.id)); setSelectedId(undefined); }}><Trash2 /></button></div>
          <div className="beacon-table-scroll"><table><thead><tr>{selected.columns.map(column => <th key={column}>{column}</th>)}</tr></thead><tbody>{selected.rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}</tbody></table></div>
        </div> : <div className="beacon-data-empty" data-ui="dataset-empty">
          <img src={emptyIllustration} alt="" width="180" height="132" />
          <p>{tab === '数据集' ? '从左侧列表选择数据集查看详情' : '从左侧列表选择数据连接查看详情'}</p>
          <p>或点击下方按钮开始</p>
          <button className="beacon-outline-button" onClick={() => tab === '数据集' ? setCreating(true) : startConnection()}><Plus />新建{tab}</button>
        </div>}
      </div>
    </div>
    <WorkbenchDialog title="新建数据集" open={creating} onOpenChange={setCreating}>
      <form onSubmit={event => { event.preventDefault(); if (!name.trim()) return; const dataset = createExampleDataset(name, newSource); setDatasets([...datasets, dataset]); setSelectedId(dataset.id); setQuery(''); setSource('全部'); setTab('数据集'); setCreating(false); setName(''); }}>
        <label className="beacon-field">名称<input autoFocus value={name} onChange={event => setName(event.target.value)} placeholder="数据集名称" required maxLength={80} /></label>
        <div className="beacon-field"><span id="beacon-new-source">数据来源</span><WorkbenchMenu label="选择数据来源" value={newSource} className="beacon-field-select" options={sourceNames.slice(1).map(label => ({ label }))} onSelect={setNewSource}><span>{newSource}</span></WorkbenchMenu></div>
        <p className="beacon-dialog-note">创建仅用于本地预览的示例数据集。</p>
        <div className="beacon-dialog-actions"><button type="button" className="beacon-outline-button" onClick={() => setCreating(false)}>取消</button><button type="submit" className="beacon-primary-button" disabled={!name.trim()}>创建</button></div>
      </form>
    </WorkbenchDialog>
    <WorkbenchDialog title={info} open={!!info} onOpenChange={open => { if (!open) setInfo(''); }}><p className="beacon-dialog-note">此预览展示数据工作台的界面与本地交互，不连接外部数据服务。</p></WorkbenchDialog>
  </section>;
}
