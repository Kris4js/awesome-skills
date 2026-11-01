import { useRef, useState } from 'react';
import { Group, Panel, Separator, type PanelImperativeHandle } from 'react-resizable-panels';
import { Bell, ChevronDown, Database, Folder, LayoutTemplate, MessageSquarePlus, PanelLeftClose, PanelLeftOpen, Plus, Puzzle, Search, Send, Sparkles, UserRound } from 'lucide-react';
import { BeaconComposer, type Prompt } from './BeaconComposer';
import { BeaconDataWorkspace } from './BeaconDataWorkspace';
import { WorkbenchDialog } from './WorkbenchDialog';
import { promptSuggestions } from './data';
import beaconIcon from '../assets/beacon-icon.svg';
import beaconWordmark from '../assets/beacon-ai-wordmark.svg';

const navigation = [
  { label: '新对话', icon: MessageSquarePlus }, { label: '数据库', icon: Database },
  { label: '资产库', icon: Folder }, { label: '模版库', icon: LayoutTemplate },
  { label: 'AI 扩展', icon: Puzzle }, { label: '定时推送', icon: Send }, { label: '监控告警', icon: Bell },
];

export function BeaconWorkbench({ onSend, initialView = 'datasets' }: { onSend?: (prompt: Prompt) => void; initialView?: 'datasets' | 'mysql-connection' }) {
  const [collapsed, setCollapsed] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(true);
  const [historySearch, setHistorySearch] = useState(false);
  const [historyQuery, setHistoryQuery] = useState('');
  const [mobilePane, setMobilePane] = useState(initialView === 'mysql-connection' ? '数据' : '对话');
  const [dataOpen, setDataOpen] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Prompt[]>([]);
  const [info, setInfo] = useState('');
  const chatPanel = useRef<PanelImperativeHandle>(null);
  const showData = () => { setDataOpen(true); setExpanded(false); setMobilePane('数据'); chatPanel.current?.expand(); };
  const reset = () => { setMessages([]); setPrompt(''); setExpanded(false); setMobilePane('对话'); chatPanel.current?.expand(); };
  return <div className={`beacon-app ${collapsed ? 'beacon-sidebar-collapsed' : ''} ${expanded ? 'beacon-workspace-expanded' : ''} ${!dataOpen ? 'beacon-workspace-closed' : ''}`} data-mobile-pane={mobilePane}>
    <aside className="beacon-sidebar" aria-label="功能入口" data-ui="sidebar">
      <div className="beacon-brand-row">
        <button className="beacon-brand" aria-label="回到首页" onClick={reset}><img src={beaconIcon} alt="" width="19" height="19" /><img className="beacon-wordmark" src={beaconWordmark} alt="灯塔 AI" width="55" height="16" /></button>
        <button className="beacon-icon-button beacon-collapse" aria-label={collapsed ? '展开侧栏' : '收起侧栏'} onClick={() => setCollapsed(!collapsed)}>{collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}</button>
      </div>
      <nav className="beacon-navigation" aria-label="主导航">{navigation.map(({ label, icon: Icon }) => <button key={label} title={collapsed ? label : undefined} aria-label={label} onClick={() => label === '新对话' ? reset() : label === '数据库' ? showData() : setInfo(label)}><Icon /><span>{label}</span></button>)}</nav>
      <div className="beacon-history">
        <div className="beacon-history-heading"><button aria-label={historyOpen ? '收起历史对话' : '展开历史对话'} aria-expanded={historyOpen} onClick={() => setHistoryOpen(!historyOpen)}><span>历史对话</span><ChevronDown className={historyOpen ? '' : 'beacon-rotate-closed'} /></button><button className="beacon-icon-button" aria-label="搜索会话" onClick={() => { setHistorySearch(!historySearch); setHistoryOpen(true); }}><Search /></button></div>
        {historySearch && <input className="beacon-history-search" aria-label="搜索历史对话" placeholder="搜索会话" value={historyQuery} onChange={event => setHistoryQuery(event.target.value)} />}
        {historyOpen && '销售数据分析'.includes(historyQuery.trim()) && <button className="beacon-history-entry" onClick={() => { setPrompt('分析销售数据的收入变化'); setMobilePane('对话'); }}>销售数据分析</button>}
      </div>
      <div className="beacon-sidebar-bottom"><button onClick={() => setInfo('探索示例')}><Sparkles /><span>探索示例</span></button><button onClick={() => setInfo('创作广场')}><LayoutTemplate /><span>创作广场</span></button><button className="beacon-profile" aria-label="个人中心" onClick={() => setInfo('个人中心')}><span className="beacon-avatar"><UserRound /></span><span>示例用户</span></button></div>
    </aside>
    <div className="beacon-mobile-tabs"><button aria-pressed={mobilePane === '对话'} onClick={() => setMobilePane('对话')}>对话</button><button aria-pressed={mobilePane === '数据'} onClick={showData}>数据</button></div>
    <Group className="beacon-panels" orientation="horizontal" id="beacon-workbench-panels">
      <Panel id="beacon-chat" className="beacon-chat-panel" defaultSize="38.2%" minSize={320} collapsible collapsedSize={0} panelRef={chatPanel}>
        <section className="beacon-chat beacon-surface" aria-label="对话区" data-ui="chat">
          <header className="beacon-chat-header">新对话</header>
          {!messages.length ? <div className="beacon-welcome"><div>
            <h1>数据<span className="beacon-hero-word">处理</span> 交给 <span className="beacon-brand-name">灯塔 AI</span></h1>
            <p>自研数据可视化引擎，帮你分析问题、生成图表，并搭建可交互的仪表盘。</p>
            <button className="beacon-context-button" onClick={showData}><Plus />添加数据或文件作为上下文</button>
          </div></div> : <div className="beacon-messages" aria-live="polite">{messages.map((message, index) => <div key={index}><p className="beacon-user-message">{message.text}</p><p className="beacon-preview-message">此预览仅展示界面，不会调用模型服务。</p></div>)}</div>}
          <div className="beacon-chat-bottom">
            {!messages.length && <div className="beacon-suggestions"><span><Sparkles />试试</span>{promptSuggestions.map(item => <button key={item} onClick={() => { setPrompt(item); document.getElementById('beacon-prompt')?.focus(); }}>{item}</button>)}</div>}
            <BeaconComposer value={prompt} onChange={setPrompt} onData={showData} onSend={message => { setMessages(previous => [...previous, message]); onSend?.(message); }} />
            <footer>腾讯灯塔出品 · 内容由 AI 生成，请注意甄别</footer>
          </div>
        </section>
      </Panel>
      <Separator className="beacon-resize-handle" aria-label="调整对话宽度" />
      <Panel id="beacon-data" className="beacon-data-panel" minSize={340}>
        {dataOpen ? <BeaconDataWorkspace initialConnectionForm={initialView === 'mysql-connection'} expanded={expanded} onExpand={() => { if (!expanded) chatPanel.current?.collapse(); else chatPanel.current?.expand(); setExpanded(!expanded); }} onClose={() => { setDataOpen(false); setExpanded(false); chatPanel.current?.expand(); }} /> : <div className="beacon-closed-panel beacon-surface"><button className="beacon-outline-button" onClick={showData}><Plus />添加数据</button></div>}
      </Panel>
    </Group>
    <WorkbenchDialog title={info} open={!!info} onOpenChange={open => { if (!open) setInfo(''); }}><p className="beacon-dialog-note">此示例复刻数据工作台页面。其他功能入口保留位置，不连接外部账户与服务。</p></WorkbenchDialog>
  </div>;
}
