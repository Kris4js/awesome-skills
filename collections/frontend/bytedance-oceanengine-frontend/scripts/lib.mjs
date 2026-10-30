// Shared by capture/verify. Browser helpers come from `ego-browser nodejs`.
import { stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";

export const SKILL = fileURLToPath(new URL("..", import.meta.url));
export const PROPS = [
  "display", "position", "box-sizing", "font-size", "font-weight", "line-height", "color",
  "background-color", "background-image", "width", "height", "min-height", "max-width",
  "padding-top", "padding-right", "padding-bottom", "padding-left",
  "margin-top", "margin-right", "margin-bottom", "margin-left",
  "border-top-width", "border-right-width", "border-bottom-width", "border-left-width",
  "border-top-style", "border-right-style", "border-bottom-style", "border-left-style",
  "border-top-color", "border-right-color", "border-bottom-color", "border-left-color",
  "border-radius", "column-gap", "row-gap", "align-items", "justify-content",
  "box-shadow", "backdrop-filter", "text-decoration-line", "cursor", "opacity",
  "fill", "stroke", "stroke-width",
];

export function targetNames(available, requested = []) {
  if (!Array.isArray(requested) || requested.some((n) => typeof n !== "string")) {
    throw new Error("Target names must be an array of strings");
  }
  if (new Set(available).size !== available.length) throw new Error("Duplicate target names in configuration");
  for (const name of [...available, ...requested]) {
    if (!/^[a-z][a-z0-9-]*$/.test(name)) throw new Error(`Invalid target name: ${name}`);
  }
  for (const name of requested) {
    if (!available.includes(name)) throw new Error(`Unknown target: ${name}`);
  }
  const selected = requested.length ? [...new Set(requested)] : available;
  if (!selected.length) throw new Error("No targets configured");
  return selected;
}

/** A selector is relative to root, or starts with @ for a portal in the document. */
export async function readParts(page, root, parts) {
  for (const [name, part] of Object.entries(parts)) {
    if (!part || (typeof part !== "string" && typeof part !== "object")) throw new Error(`Invalid part: ${name}`);
    if (typeof part === "object" && part.props !== undefined &&
        (!Array.isArray(part.props) || !part.props.length || part.props.some((prop) => typeof prop !== "string"))) {
      throw new Error(`Part ${name} needs a nonempty string props array`);
    }
  }
  return page.evaluate(({ root, parts, defaults }) => {
    const visible = (scope, selector) => {
      const matches = [...(scope.matches?.(selector) ? [scope] : []), ...scope.querySelectorAll(selector)];
      return matches.find((el) => {
        const rect = el.getBoundingClientRect();
        const css = getComputedStyle(el);
        return (rect.width > 0 || rect.height > 0) && css.display !== "none" && css.visibility !== "hidden" && css.opacity !== "0";
      });
    };
    const base = visible(document, root);
    if (!base) throw new Error(`Visible root not found: ${root}`);
    const result = {};
    for (const [name, definition] of Object.entries(parts)) {
      const rule = typeof definition === "string" ? { selector: definition } : definition;
      const raw = rule.selector ?? `:scope[data-ui-part="${name}"], [data-ui-part="${name}"]`;
      const global = raw.startsWith("@");
      const selector = global ? raw.slice(1) : raw;
      const pseudo = selector.match(/::[a-z-]+(?:\([^)]*\))?$/i)?.[0];
      const elementSelector = pseudo ? selector.slice(0, -pseudo.length) : selector;
      const element = elementSelector === ":scope" && !global ? base : visible(global ? document : base, elementSelector);
      if (!element) throw new Error(`Visible part not found: ${name} (${raw})`);
      const css = getComputedStyle(element, pseudo ?? null);
      if (pseudo && (css.content === "none" || css.display === "none")) {
        throw new Error(`Visible pseudo-element not found: ${name} (${raw})`);
      }
      result[name] = Object.fromEntries((rule.props ?? defaults).map((prop) => [prop, css.getPropertyValue(prop)]));
      if (pseudo) result[name].content = css.content;
    }
    return result;
  }, { root, parts, defaults: PROPS });
}

/** Scroll to the root before interactions only when it already exists (portals may open later). */
export async function scrollExisting(page, selector) {
  await page.evaluate((selector) => {
    document.querySelector(selector)?.scrollIntoView({ block: "center" });
  }, selector);
}

/** Capture all requested elements; one missing element must never yield a partial screenshot. */
export async function shoot(page, selectors, path, pad = 16) {
  if (!Array.isArray(selectors) || !selectors.length) throw new Error("Screenshot requires selectors");
  const rect = await page.evaluate(({ selectors, pad }) => {
    const boxes = selectors.map((raw) => {
      const selector = raw.startsWith("@") ? raw.slice(1) : raw;
      const box = [...document.querySelectorAll(selector)].map((el) => ({ el, box: el.getBoundingClientRect() }))
        .find(({ el, box }) => box.width > 0 && box.height > 0 && getComputedStyle(el).visibility !== "hidden" && getComputedStyle(el).opacity !== "0")?.box;
      if (!box) throw new Error(`Screenshot element not found: ${selector}`);
      return box;
    });
    // ego screenshot clips use page coordinates; DOM bounds use viewport coordinates.
    const x = Math.max(0, Math.min(...boxes.map((b) => b.left)) + scrollX - pad);
    const y = Math.max(0, Math.min(...boxes.map((b) => b.top)) + scrollY - pad);
    return {
      x, y,
      width: Math.max(...boxes.map((b) => b.right)) + scrollX + pad - x,
      height: Math.max(...boxes.map((b) => b.bottom)) + scrollY + pad - y,
    };
  }, { selectors, pad });
  if (rect.width <= 0 || rect.height <= 0) throw new Error("Screenshot target is outside the capture area");
  await page.screenshot({ path, clip: rect });
  if (!(await stat(path)).size) throw new Error(`Screenshot is empty: ${path}`);
  return rect;
}

/** Browser steps include idempotent checkbox state and pointer drag for sortable lists. */
export async function run(page, steps = []) {
  const actions = ["click", "hover", "wait", "pause", "scroll", "move", "fill", "press", "check", "drag"];
  for (const step of steps) {
    console.log("  step", JSON.stringify(step));
    const keys = actions.filter((key) => step[key] !== undefined);
    if (keys.length !== 1) throw new Error(`Each step needs exactly one action: ${JSON.stringify(step)}`);
    const timeout = step.timeout ?? 20000;
    const key = keys[0];
    if (key === "click") await page.click(step.click, { label: "Open reference state", timeout });
    if (key === "hover") await page.hover(step.hover, { label: "Hover reference target", timeout });
    if (key === "wait") await page.waitForSelector(step.wait, { timeout });
    if (key === "pause") {
      if (!Number.isFinite(step.pause) || step.pause < 0 || step.pause > 10000) throw new Error("Pause must be 0–10000ms");
      await page.waitForTimeout(step.pause);
    }
    if (key === "scroll") {
      await page.evaluate((selector) => {
        const element = document.querySelector(selector);
        if (!element) throw new Error(`Scroll target not found: ${selector}`);
        element.scrollIntoView({ block: "center" });
      }, step.scroll);
    }
    if (key === "move") await page.mouse.move(step.move.x, step.move.y);
    if (key === "fill") await page.fill(step.fill.selector, step.fill.value, { timeout });
    if (key === "press") await page.press(step.press.selector, step.press.key, { timeout });
    if (key === "check") {
      const { selector, checked, click = selector } = step.check;
      if (typeof selector !== "string" || typeof checked !== "boolean") throw new Error("Check needs a selector and boolean checked state");
      const current = await page.evaluate((selector) => {
        const element = document.querySelector(selector);
        if (!element) throw new Error(`Checkbox not found: ${selector}`);
        return element.matches('input[type="checkbox"]') ? element.checked : element.getAttribute("aria-checked") === "true";
      }, selector);
      if (current !== checked) await page.click(click, { label: "Set comparison state", timeout });
      await page.waitForFunction(({ selector, checked }) => {
        const element = document.querySelector(selector);
        return element && (element.matches('input[type="checkbox"]') ? element.checked : element.getAttribute("aria-checked") === "true") === checked;
      }, { selector, checked }, { timeout });
    }
    if (key === "drag") {
      const { source, target, position = "after" } = step.drag;
      if (typeof source !== "string" || typeof target !== "string" || !["before", "after"].includes(position)) throw new Error("Drag needs source, target and before/after position");
      await page.hover(source, { label: "Locate reorder handle", timeout });
      const bounds = await page.evaluate(({ source, target, position }) => {
        const from = document.querySelector(source)?.getBoundingClientRect();
        const to = document.querySelector(target)?.getBoundingClientRect();
        if (!from?.width || !to?.width) throw new Error("Visible drag source and target required");
        return { x: from.x + from.width / 2, y: from.y + from.height / 2, toX: to.x + to.width / 2, toY: position === "after" ? to.bottom - 2 : to.top + 2 };
      }, { source, target, position });
      await page.mouse.move(bounds.x, bounds.y);
      await page.mouse.down();
      try {
        for (let i = 1; i <= 12; i++) {
          await page.mouse.move(bounds.x + (bounds.toX - bounds.x) * i / 12, bounds.y + (bounds.toY - bounds.y) * i / 12, { label: "Reorder selected item" });
        }
      } finally { await page.mouse.up(); }
    }
  }
}

export async function metadata(page, steps = []) {
  return {
    source: (await page.url()).split("?")[0],
    captured: new Date().toISOString(),
    viewport: await page.evaluate(() => ({ width: innerWidth, height: innerHeight, devicePixelRatio })),
    state: steps,
  };
}

/** Only transparent no-op shadows are ignored, as Tailwind includes them before the real shadow. */
export function normalizeCss(value, property) {
  if (typeof value !== "string") return value;
  const text = value.trim().replace(/\s+/g, " ");
  if (property !== "box-shadow") return text;
  return text.split(/,\s*(?![^()]*\))/)
    .filter((shadow) => !/^(?:inset )?rgba\(0, 0, 0, 0\) 0px 0px 0px(?: 0px)?(?: inset)?$/.test(shadow))
    .join(", ") || "none";
}

export function cssEqual(expected, actual, property, tolerance = 0.1) {
  const a = normalizeCss(expected, property);
  const b = normalizeCss(actual, property);
  if (a === b) return true;
  if (typeof a !== "string" || typeof b !== "string") return false;
  const pixels = /-?(?:\d*\.)?\d+px/g;
  const av = [...a.matchAll(pixels)].map((m) => Number.parseFloat(m[0]));
  const bv = [...b.matchAll(pixels)].map((m) => Number.parseFloat(m[0]));
  return av.length > 0 && av.length === bv.length && a.replace(pixels, "#px") === b.replace(pixels, "#px") &&
    av.every((value, i) => Math.abs(value - bv[i]) <= tolerance + Number.EPSILON);
}
