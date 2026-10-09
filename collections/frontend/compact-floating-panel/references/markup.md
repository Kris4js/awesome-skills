# 结构起点

将下面 HTML 插入 ShadowRoot 内；先加载 `assets/panel.css`。这是静态组件骨架，收起/恢复/拖动/业务动作需按 SKILL 实现，示例按钮未绑定行为。动态数据使用DOM API或框架转义，不把外部HTML直接拼进模板。

```html
<div class="fp">
  <section class="fp-panel" role="dialog" aria-label="工具窗口">
    <header class="fp-header" tabindex="0" aria-label="窗口标题栏，方向键移动">
      <div class="fp-brand" aria-hidden="true">◈</div>
      <div class="fp-heading"><h1>工具窗口</h1><span class="fp-meta">本地工作区</span></div>
      <button class="fp-icon-button" type="button" data-action="hide" aria-label="收起窗口">−</button>
    </header>
    <main class="fp-body">
      <section class="fp-section">
        <div class="fp-section-heading"><h2>工作列表</h2><span class="fp-count">1</span></div>
        <ul class="fp-list fp-list--queue">
          <li><label class="fp-list-item"><input type="radio" name="entry" checked><span><strong>示例项目</strong><small class="fp-meta">项目说明</small></span></label></li>
        </ul>
        <div class="fp-fields">
          <label class="fp-field">最小间隔<input type="number" min="0.5" value="0.5"></label>
          <label class="fp-field">最大间隔<input type="number" min="0.5" value="2"></label>
          <label class="fp-field fp-field--full">处理方式<select><option>标准</option><option>精简</option></select></label>
        </div>
        <div class="fp-segmented" role="group" aria-label="内容范围">
          <label><input type="radio" name="scope" value="all" checked><span>全部</span></label>
          <label><input type="radio" name="scope" value="text"><span>文字</span></label>
          <label><input type="radio" name="scope" value="image"><span>图片</span></label>
        </div>
      </section>
      <section class="fp-section">
        <h2>结果概览</h2>
        <div class="fp-stats">
          <div class="fp-stat"><span>项目</span><strong>1</strong></div>
          <div class="fp-stat"><span>已完成</span><strong>0</strong></div>
          <div class="fp-stat"><span>待处理</span><strong>1</strong></div>
          <div class="fp-stat"><span>异常</span><strong>0</strong></div>
        </div>
        <details class="fp-group" open>
          <summary>项目详情<span class="fp-count">2</span><span class="fp-status"><i class="fp-dot" aria-hidden="true"></i>待处理</span></summary>
          <div class="fp-group-body">
            <div class="fp-tags"><span class="fp-tag">标签一 12</span><span class="fp-tag">标签二 8</span></div>
            <dl class="fp-kv"><dt>名称</dt><dd>示例项目</dd><dt>说明</dt><dd>长内容允许自然换行</dd></dl>
            <ul class="fp-text-list"><li>普通列表使用11px字号</li><li>业务数据安全填充</li></ul>
            <div class="fp-table-wrap"><table><thead><tr><th scope="col">项目</th><th scope="col">状态</th></tr></thead><tbody><tr><td>示例</td><td>待处理</td></tr></tbody></table></div>
            <p class="fp-note" role="status">尚未开始</p>
          </div>
        </details>
      </section>
    </main>
    <footer class="fp-footer fp-footer--stack">
      <button class="fp-primary" type="button" data-action="start">开始</button>
      <button type="button" disabled>暂停</button><button type="button" disabled>结束</button><button type="button" disabled>导出</button>
    </footer>
  </section>
  <button class="fp-ball" type="button" data-action="show" aria-label="恢复工具窗口" hidden>工具</button>
</div>
```

## 图片片段

只将已知可信资源地址赋给src/href；Blob URL需在销毁时释放。图片名称和alt来自数据时用安全赋值。

```html
<a href="原图地址" target="_blank" rel="noopener noreferrer"><img class="fp-thumb" src="缩略图地址" alt="项目预览" loading="lazy"></a>
<div class="fp-gallery"><img src="图片地址" alt="完整内容预览" loading="lazy"></div>
```

## 真正内容标签页（可选）

```html
<div class="fp-tabs" role="tablist" aria-label="结果类型">
  <button id="tool-tab-list" role="tab" aria-selected="true" aria-controls="tool-panel-list" tabindex="0">列表</button>
  <button id="tool-tab-images" role="tab" aria-selected="false" aria-controls="tool-panel-images" tabindex="-1">图片</button>
</div>
<section id="tool-panel-list" role="tabpanel" aria-labelledby="tool-tab-list">列表内容</section>
<section id="tool-panel-images" role="tabpanel" aria-labelledby="tool-tab-images" hidden>图片内容</section>
```

实现者须接入点击与左右方向键，更新aria-selected、tabindex、hidden。多实例前缀必须唯一。

## 宿主与拖动约束

宿主style推荐：`all:initial;position:fixed;inset:0;width:0;height:0;z-index:2147483647`。普通文档预览可直接使用CSS，但抗宿主污染需Shadow DOM。

坐标约束：`left = max(8, min(x, viewportWidth - panelWidth - 8))`，top同理。resize与恢复显示后调用。首次布局保留CSS初始位置；首次拖动再将right改为auto。

收起/恢复至少绑定：panel.hidden、ball.hidden、焦点转移。退出时移除监听与宿主；收起时不退出、不卸载。
