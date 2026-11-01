import { useRef, useState } from 'react';
import { ArrowUp, Blocks, FileText, Paperclip, Plus, Puzzle, Sparkles, X, Zap } from 'lucide-react';
import { WorkbenchMenu } from './WorkbenchMenu';
import { modelNames } from './data';

export type Prompt = { text: string; model: string; mode: string; skill: string; style: string; attachments: string[] };

export function BeaconComposer({ value, onChange, onSend, onData }: {
  value: string; onChange: (value: string) => void; onSend: (prompt: Prompt) => void; onData: () => void;
}) {
  const [model, setModel] = useState('DeepSeek Flash');
  const [mode, setMode] = useState('自动');
  const [skill, setSkill] = useState('技能');
  const [style, setStyle] = useState('风格');
  const [files, setFiles] = useState<string[]>([]);
  const input = useRef<HTMLInputElement>(null);
  const editor = useRef<HTMLTextAreaElement>(null);
  const send = () => {
    if (!value.trim()) return;
    onSend({ text: value.trim(), model, mode, skill, style, attachments: files });
    onChange(''); setFiles([]); editor.current?.focus();
  };
  return <div className="beacon-composer" data-ui="composer">
    {!!files.length && <div className="beacon-attachments">{files.map((file, index) => <span key={`${index}-${file}`}><FileText />{file}
      <button aria-label={`移除附件 ${file}`} onClick={() => setFiles(files.filter((_, i) => i !== index))}><X /></button>
    </span>)}</div>}
    <label className="beacon-sr-only" htmlFor="beacon-prompt">向 AI 提问</label>
    <textarea ref={editor} id="beacon-prompt" value={value} onChange={event => onChange(event.target.value)}
      placeholder="直接提问，@ 引用文件、/ 选择技能；支持粘贴文件附件"
      onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); send(); } }}
      onPaste={event => { const pasted = [...event.clipboardData.files]; if (pasted.length) { event.preventDefault(); setFiles(previous => [...previous, ...pasted.map(file => file.name)]); } }} />
    <div className="beacon-composer-toolbar">
      <div className="beacon-composer-tools">
        <WorkbenchMenu label="添加内容" chevron={false} side="top" className="beacon-add-menu" options={[
          { label: '上传文件', icon: <Paperclip /> }, { label: '引用数据集', icon: <FileText /> },
        ]} onSelect={item => item === '上传文件' ? input.current?.click() : onData()}><Plus /></WorkbenchMenu>
        <span className="beacon-tool-divider" />
        <WorkbenchMenu label="选择技能" value={skill} side="top" options={['数据分析', '数据可视化', 'SQL 查询'].map(label => ({ label }))} onSelect={setSkill}><Puzzle /><span>{skill}</span></WorkbenchMenu>
        <WorkbenchMenu label="选择模式" value={mode} side="top" options={['自动', '快速', '深度分析'].map(label => ({ label }))} onSelect={setMode}><Zap /><span>{mode}</span></WorkbenchMenu>
        <WorkbenchMenu label="选择智能风格" value={style} side="top" options={['TDesign 企业', '简洁浅色', '数据报告'].map(label => ({ label }))} onSelect={setStyle}><Blocks /><span>{style}</span></WorkbenchMenu>
      </div>
      <div className="beacon-composer-actions">
        <WorkbenchMenu label={`模型：${model}`} value={model} side="top" className="beacon-model" options={modelNames.map(label => ({ label }))} onSelect={setModel}>
          <Sparkles className="beacon-model-icon" /><span>{model}</span>
        </WorkbenchMenu>
        <button className="beacon-send" aria-label="发送消息" disabled={!value.trim()} onClick={send}><ArrowUp /></button>
      </div>
    </div>
    <input ref={input} type="file" multiple className="beacon-sr-only" aria-label="选择本地附件"
      onChange={event => { setFiles(previous => [...previous, ...[...(event.target.files ?? [])].map(file => file.name)]); event.target.value = ''; }} />
  </div>;
}
