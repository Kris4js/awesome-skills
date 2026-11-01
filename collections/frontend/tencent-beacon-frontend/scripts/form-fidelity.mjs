import { readFile, writeFile } from 'node:fs/promises';

const referencePath = new URL('../references/specs/connection-form.json', import.meta.url);

/** Collect only visible form presentation; never read field values or account content. */
export async function captureForm(page, source = false) {
  return page.evaluate(source => {
    const host = document.querySelector('input[placeholder="请输入地址 Host"]');
    if (!host) throw new Error('MySQL form is not open.');
    const input = placeholder => document.querySelector(`[placeholder="${placeholder}"]`);
    const byText = (root, selector, text) => [...root.querySelectorAll(selector)].find(element => element.textContent.trim() === text);
    const back = document.querySelector(source ? '[aria-label="返回"]' : '[aria-label="返回数据连接"]');
    const header = source ? back.parentElement.parentElement : back.parentElement;
    const root = source ? header.parentElement : document.querySelector('[data-ui="connection-form"]');
    const card = source ? host.parentElement.parentElement.parentElement : root.querySelector('.beacon-connection-card');
    const username = input('请输入用户名');
    const password = input('请输入密码');
    const description = input('可选，用于说明该连接的用途、环境等');
    const administrator = source ? [...root.querySelectorAll('button')].find(element => element.textContent.includes('输入 用户ID')) : root.querySelector('.beacon-admin-select');
    const administratorLabel = source ? administrator.parentElement.parentElement.querySelector('label') : root.querySelector('.beacon-admin-label');
    const submit = byText(root, 'button', '提交');
    const protocolLabel = byText(card, 'label', 'HTTP');
    const label = field => source ? field.parentElement.querySelector('label') : field.closest('.beacon-connection-field').querySelector('.beacon-connection-label');
    const targets = {
      header, back, title: header.querySelector('h2,h3,h4'), subtitle: byText(header, 'p,span', 'MySQL'),
      sectionTitle: byText(root, 'h3,p', '基本信息'), card,
      protocolRow: protocolLabel?.parentElement, protocolLabel,
      protocolControl: protocolLabel?.querySelector(source ? 'span' : 'input'),
      hostRow: source ? host.parentElement.parentElement : root.querySelector('.beacon-connection-host-row'),
      hostLabel: label(host), hostInput: host, portInput: source ? input('3306') : root.querySelector('[name="port"]'),
      databaseLabel: label(input('请输入数据库')), databaseInput: input('请输入数据库'),
      usernameLabel: label(username), usernameInput: username,
      passwordLabel: source ? password.parentElement.parentElement.querySelector('label') : label(password), passwordInput: password,
      testButton: byText(root, 'button', '连接测试'),
      nameLabel: label(input('可自定义有意义的数据库中文名称')), nameInput: input('可自定义有意义的数据库中文名称'),
      descriptionLabel: label(description), descriptionInput: description,
      administratorLabel, administratorNote: administratorLabel?.querySelector('span'), administrator,
      administratorPlaceholder: source ? administrator?.querySelector('span') : root.querySelector('.beacon-admin-placeholder'),
      footer: submit?.parentElement, cancel: byText(root, 'button', '取消'), submit,
    };
    const properties = ['font-family', 'font-size', 'font-weight', 'line-height', 'color', 'background-color', 'height', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'border-top-width', 'border-top-color', 'border-radius', 'box-shadow', 'gap', 'row-gap', 'resize'];
    const cardRect = card.getBoundingClientRect();
    return {
      viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio },
      targets: Object.fromEntries(Object.entries(targets).map(([key, element]) => {
        if (!element) return [key, null];
        const css = getComputedStyle(element), rect = element.getBoundingClientRect();
        return [key, { style: Object.fromEntries(properties.map(property => [property, css.getPropertyValue(property)])), rect: { x: rect.x - cardRect.x, y: rect.y - cardRect.y, width: rect.width, height: rect.height }, ...(element.matches('input,textarea') ? { placeholderStyle: Object.fromEntries(['font-family', 'font-size', 'font-weight', 'line-height', 'color', 'opacity', '-webkit-font-smoothing'].map(property => [property, getComputedStyle(element, '::placeholder').getPropertyValue(property)])) } : {}) }];
      })),
    };
  }, source);
}

function normalizedShadow(value) {
  return value.split(/,\s*(?![^()]*\))/).filter(shadow => !/^rgba\(0, 0, 0, 0\) 0px 0px 0px(?: 0px)?$/.test(shadow)).join(', ') || 'none';
}

export async function compareForm(page, { reportPath = '/tmp/beacon-form-fidelity.json' } = {}) {
  const reference = JSON.parse(await readFile(referencePath, 'utf8'));
  await page.click('.beacon-connection-scroll > h3', { label: '恢复默认表单状态' });
  const current = await captureForm(page);
  const differences = [];
  for (const [target, properties] of Object.entries(reference.assertions)) {
    for (const property of properties) {
      const expected = reference.targets[target]?.style[property];
      const actual = current.targets[target]?.style[property];
      const normalize = property === 'box-shadow' ? normalizedShadow : value => value;
      if (normalize(actual ?? '') !== normalize(expected ?? '')) differences.push({ target, property, expected, actual });
    }
  }
  for (const target of reference.geometryTargets ?? []) {
    for (const property of ['x', 'y', 'width', 'height']) {
      const expected = reference.targets[target].rect[property], actual = current.targets[target]?.rect[property];
      if (actual === undefined || Math.abs(actual - expected) > 0.1) differences.push({ target, property: `rect.${property}`, expected, actual });
    }
  }
  let comparedPlaceholder = 0;
  for (const [target, expectedTarget] of Object.entries(reference.targets)) {
    for (const [property, expected] of Object.entries(expectedTarget?.placeholderStyle ?? {})) {
      comparedPlaceholder++;
      const actual = current.targets[target]?.placeholderStyle?.[property];
      if (actual !== expected) differences.push({ target, property: `::placeholder.${property}`, expected, actual });
    }
  }
  await page.click('input[placeholder="请输入地址 Host"]', { label: '检查输入焦点样式' });
  await page.press('input[placeholder="请输入地址 Host"]', 'Tab');
  await page.press('[name="port"]', 'Shift+Tab');
  const focused = await page.evaluate(() => { const style = getComputedStyle(document.querySelector('input[placeholder="请输入地址 Host"]')); return { 'border-color': style.borderColor, 'box-shadow': style.boxShadow }; });
  for (const [property, expected] of Object.entries(reference.focusedInput ?? {})) {
    const actual = focused[property];
    const normalize = property === 'box-shadow' ? normalizedShadow : value => value;
    if (normalize(actual ?? '') !== normalize(expected)) differences.push({ target: 'focusedInput', property, expected, actual });
  }
  await page.click('.beacon-connection-scroll > h3', { label: '恢复表单默认焦点状态' });
  const report = { comparedPlaceholder, checked: new Date().toISOString(), comparedProperties: Object.values(reference.assertions).reduce((sum, properties) => sum + properties.length, 0), comparedGeometry: (reference.geometryTargets?.length ?? 0) * 4, comparedFocus: Object.keys(reference.focusedInput ?? {}).length, differences };
  await writeFile(reportPath, JSON.stringify(report, null, 2) + '\n');
  console.log(report);
  if (differences.length) throw new Error(`Form differs from the captured reference in ${differences.length} properties.`);
  return report;
}
