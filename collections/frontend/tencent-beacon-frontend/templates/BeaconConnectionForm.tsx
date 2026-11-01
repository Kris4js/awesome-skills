import { useRef, useState } from 'react';
import { Combobox } from '@base-ui/react/combobox';
import { ArrowLeft, Check, ChevronDown, CircleAlert, RefreshCw, Search, X } from 'lucide-react';
import mysqlIcon from '../assets/mysql.svg';

export type MySqlConnectionDraft = {
  protocol: 'HTTP' | 'TCP'; host: string; port: string; database: string;
  username: string; password: string; name: string; description: string; administrators: string[];
};

function AdministratorSelect({ value, onChange, options }: { value: string[]; onChange: (value: string[]) => void; options: string[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const anchor = useRef<HTMLButtonElement>(null);
  const items = [...new Set([...options, ...value, ...(query.trim() ? [query.trim()] : [])])];
  return <Combobox.Root multiple items={items} value={value} onValueChange={onChange} open={open} onOpenChange={setOpen} inputValue={query} onInputValueChange={setQuery}>
    <Combobox.Trigger ref={anchor} className="beacon-admin-select" aria-labelledby="beacon-admin-label" aria-label="展开管理员选项" data-open={open}>
      {value.length ? value.map(item => <span key={item} className="beacon-admin-chip">{item}</span>) : <span className="beacon-admin-placeholder">输入 用户ID / 姓名搜索，或粘贴多个用户 ID...</span>}
      <ChevronDown className="beacon-chevron" />
    </Combobox.Trigger>
    <Combobox.Portal><Combobox.Positioner anchor={anchor} sideOffset={4} className="beacon-menu-positioner">
      <Combobox.Popup className="beacon-menu beacon-admin-popup">
        <div className="beacon-admin-search"><Search /><Combobox.Input id="beacon-administrators" aria-label="搜索管理员" placeholder="输入 用户ID / 姓名搜索，或粘贴多个用户 ID..."
        onPaste={event => {
          const pasted = event.clipboardData.getData('text').split(/[\s,，;；]+/).map(item => item.trim()).filter(Boolean);
          if (pasted.length > 1) { event.preventDefault(); onChange([...new Set([...value, ...pasted])]); setQuery(''); }
        }} />{query && <button type="button" aria-label="清空管理员搜索" onClick={() => setQuery('')}><X /></button>}</div>
        {!!value.length && <div className="beacon-admin-selected">{value.map(item => <span key={item}>{item}<button type="button" aria-label={`移除管理员 ${item}`} onClick={() => onChange(value.filter(selected => selected !== item))}><X /></button></span>)}</div>}
        <Combobox.Empty className="beacon-menu-group">无匹配管理员</Combobox.Empty>
        <Combobox.List aria-label="管理员选项">{(item: string) => <Combobox.Item className="beacon-menu-item" value={item} key={item}><span>{item}</span><Combobox.ItemIndicator className="beacon-menu-check"><Check /></Combobox.ItemIndicator></Combobox.Item>}</Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner></Combobox.Portal>
  </Combobox.Root>;
}

export function BeaconConnectionForm({ onCancel, onSubmit, administratorOptions = [] }: { onCancel: () => void; onSubmit: (connection: MySqlConnectionDraft) => void; administratorOptions?: string[] }) {
  const [draft, setDraft] = useState<MySqlConnectionDraft>({ protocol: 'HTTP', host: '', port: '3306', database: '', username: '', password: '', name: '', description: '', administrators: [] });
  const [testMessage, setTestMessage] = useState('');
  const [error, setError] = useState('');
  const update = <Key extends keyof MySqlConnectionDraft>(key: Key, value: MySqlConnectionDraft[Key]) => { setDraft(previous => ({ ...previous, [key]: value })); setTestMessage(''); };
  const hasConnectionFields = () => !!(draft.host.trim() && draft.port && draft.database.trim() && draft.username.trim() && draft.password);
  const testConnection = () => {
    if (!hasConnectionFields()) { setError('请填写完整的连接信息'); return; }
    setError('');
    setTestMessage('字段校验通过。当前为本地预览，未连接数据库。');
  };
  const required = <span className="beacon-required" aria-hidden="true">*</span>;
  return <section className="beacon-connection-page" aria-label="新建 MySQL 数据连接" data-ui="connection-form">
    <header className="beacon-connection-header"><button className="beacon-icon-button" aria-label="返回数据连接" onClick={onCancel}><ArrowLeft /></button><img src={mysqlIcon} className="beacon-mysql-icon" width="20" height="20" alt="" /><div><h2>新建数据连接</h2><span>MySQL</span></div></header>
    <form noValidate onSubmit={event => {
      event.preventDefault();
      if (!draft.name.trim()) { setError('请填写数据连接名称'); return; }
      if (!hasConnectionFields()) { setError('请填写完整的连接信息'); return; }
      setError('');
      onSubmit({ ...draft, host: draft.host.trim(), database: draft.database.trim(), username: draft.username.trim(), name: draft.name.trim() });
    }}>
      <div className="beacon-connection-scroll">
        <h3>基本信息</h3>
        <div className="beacon-connection-card">
          <fieldset className="beacon-protocol"><legend className="beacon-sr-only">连接协议</legend>{(['HTTP', 'TCP'] as const).map(protocol => <label key={protocol}><input type="radio" name="protocol" value={protocol} checked={draft.protocol === protocol} onChange={() => update('protocol', protocol)} />{protocol}</label>)}</fieldset>
          <div className="beacon-connection-host-row">
            <label className="beacon-connection-field"><span className="beacon-connection-label">地址 Host {required}</span><input name="host" value={draft.host} onChange={event => update('host', event.target.value)} placeholder="请输入地址 Host" required autoComplete="off" /></label>
            <label className="beacon-connection-field"><span className="beacon-connection-label">端口号 {required}</span><input name="port" placeholder="3306" type="number" value={draft.port} onChange={event => update('port', event.target.value)} required /></label>
          </div>
          <label className="beacon-connection-field beacon-connection-database"><span className="beacon-connection-label">数据库 {required}</span><input name="database" value={draft.database} onChange={event => update('database', event.target.value)} placeholder="请输入数据库" required autoComplete="off" /></label>
          <div className="beacon-connection-credentials">
            <label className="beacon-connection-field"><span className="beacon-connection-label">用户名 {required}</span><input name="username" value={draft.username} onChange={event => update('username', event.target.value)} placeholder="请输入用户名" required autoComplete="off" /></label>
            <div className="beacon-connection-field"><label className="beacon-connection-label" htmlFor="beacon-connection-password">密码 {required}</label><div className="beacon-password-row"><input id="beacon-connection-password" name="password" type="password" value={draft.password} onChange={event => update('password', event.target.value)} placeholder="请输入密码" required autoComplete="new-password" /><button className="beacon-connection-test" type="button" onClick={testConnection}><RefreshCw />连接测试</button></div></div>
          </div>
          <label className="beacon-connection-field"><span className="beacon-connection-label">数据连接名称 {required}</span><input name="name" value={draft.name} onChange={event => update('name', event.target.value)} placeholder="可自定义有意义的数据库中文名称" required /></label>
          <label className="beacon-connection-field"><span className="beacon-connection-label">描述</span><textarea name="description" value={draft.description} onChange={event => update('description', event.target.value)} placeholder="可选，用于说明该连接的用途、环境等" rows={3} /></label>
          <div className="beacon-connection-field"><label id="beacon-admin-label" className="beacon-connection-label beacon-admin-label">管理员<span className="beacon-admin-note">（可选，配置后其他用户也可查看、编辑该连接并基于该连接创建数据集）</span></label><AdministratorSelect options={administratorOptions} value={draft.administrators} onChange={value => update('administrators', value)} /></div>
          {error && <div className="beacon-connection-error" role="alert"><CircleAlert />{error}</div>}
          {testMessage && <p className="beacon-connection-status" role="status">{testMessage}</p>}
        </div>
      </div>
      <footer className="beacon-connection-footer"><button type="button" onClick={onCancel}>取消</button><button type="submit" className="beacon-primary-button">提交</button></footer>
    </form>
  </section>;
}
