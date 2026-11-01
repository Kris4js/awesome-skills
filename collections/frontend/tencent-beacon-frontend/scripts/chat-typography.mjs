import { readFile, writeFile } from 'node:fs/promises';
export async function captureChat(page, source = false) {
  return page.evaluate(source => {
    const exact = text => [...document.querySelectorAll('span,p,button,div')].find(e => e.textContent.trim() === text && !e.children.length);
    const entries = source ? {
      header: document.querySelector('[title="新对话"]'), title: document.querySelector('.font-noto-sans'), brand: document.querySelector('.font-brand-name'),
      description: exact('自研数据可视化引擎，帮你分析问题、生成图表，并搭建可交互的仪表盘。'), context: exact('添加数据或文件作为上下文'),
      suggestion: exact('生成经营仪表盘'), skill: exact('技能'), mode: exact('自动'), style: exact('风格'), model: exact('DeepSeek Flash'),
      editor: document.querySelector('[contenteditable=true]'), placeholder: document.querySelector('[data-placeholder]'),
      footer: exact('腾讯灯塔出品 · 内容由 AI 生成，请注意甄别'),
    } : Object.fromEntries(Object.entries({header:'.beacon-chat-header',title:'.beacon-welcome h1',brand:'.beacon-brand-name',description:'.beacon-welcome p',context:'.beacon-context-button',suggestion:'.beacon-suggestions button',skill:'[aria-label="选择技能"]',mode:'[aria-label="选择模式"]',style:'[aria-label="选择智能风格"]',model:'.beacon-model',editor:'#beacon-prompt',placeholder:'#beacon-prompt',footer:'.beacon-chat-bottom footer'}).map(([key,selector])=>[key,document.querySelector(selector)]));
    return Object.fromEntries(Object.entries(entries).map(([key,element]) => {
      if (!element) throw new Error(`Missing chat target: ${key}`);
      const style = getComputedStyle(element, key === 'placeholder' ? (source ? '::before' : '::placeholder') : null);
      return [key, Object.fromEntries(['font-family','font-size','font-weight','line-height','color','-webkit-font-smoothing','letter-spacing'].map(property=>[property,style.getPropertyValue(property)]))];
    }));
  }, source);
}
export async function compareChat(page, reportPath) {
  const expected = JSON.parse(await readFile(new URL('../references/specs/chat-typography.json', import.meta.url), 'utf8'));
  const actual = await captureChat(page);
  const differences = [];
  for (const [target, properties] of Object.entries(expected)) for (const [property, value] of Object.entries(properties)) if (actual[target][property] !== value) differences.push({target,property,expected:value,actual:actual[target][property]});
  const report = {checked:new Date().toISOString(),comparedProperties:Object.values(expected).reduce((n,p)=>n+Object.keys(p).length,0),differences};
  await writeFile(reportPath,JSON.stringify(report,null,2)+'\n');
  console.log(report);
  if(differences.length) throw new Error('Chat typography differs from reference.');
}
