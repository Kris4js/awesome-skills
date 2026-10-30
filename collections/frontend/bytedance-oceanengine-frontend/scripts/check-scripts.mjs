// Offline smoke checks: `node scripts/check-scripts.mjs`. Does not launch a browser.
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { cssEqual, readParts, run, shoot, SKILL, targetNames } from "./lib.mjs";

assert.deepEqual(targetNames(["tabs", "card"], ["card", "card"]), ["card"]);
assert.throws(() => targetNames(["tabs"], ["typo"]), /Unknown target/);
assert.throws(() => targetNames([]), /No targets/);
assert.throws(() => targetNames(["tabs", "tabs"]), /Duplicate/);
assert(cssEqual("13.8px", "13.7969px", "line-height"));
assert(!cssEqual("13.8px", "14px", "line-height"));
assert(!cssEqual("rgb(0, 0, 0)", "rgb(1, 0, 0)", "color"));
assert(cssEqual("none", "rgba(0, 0, 0, 0) 0px 0px 0px 0px", "box-shadow"));
assert(cssEqual("rgba(0, 0, 0, 0.08) 0px 3px 9px 0px", "rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.08) 0px 3px 9px 0px", "box-shadow"));
assert(!cssEqual("none", "rgba(0, 0, 0, 0) 0px 3px 9px 0px", "box-shadow"));

// Small DOM stand-in to exercise the functions that are serialized into ego's page context.
const element = (style = {}) => ({
  style,
  matches: () => false,
  querySelectorAll: () => [],
  getBoundingClientRect: () => ({ left: 10, top: 20, right: 110, bottom: 50, width: 100, height: 30 }),
});
const child = element({ color: "rgb(49, 52, 59)" });
const portal = element({ "background-color": "rgb(255, 255, 255)" });
const hidden = element({ display: "none" });
const root = element({ height: "30px" });
root.matches = (selector) => selector === '[data-ui-part="strip"]';
root.querySelectorAll = (selector) => selector === ".label" ? [hidden, child] : [];
globalThis.document = { querySelectorAll: (selector) => selector === ".root" ? [root] : selector === ".portal" ? [portal] : [] };
globalThis.getComputedStyle = (el, pseudo) => ({
  display: el.style.display ?? "block", visibility: "visible", opacity: "1",
  content: pseudo ? '""' : "none",
  getPropertyValue: (prop) => pseudo && prop === "width" ? "1px" : (el.style[prop] ?? ""),
});
const page = { evaluate: async (callback, value) => callback(value) };
assert.deepEqual(await readParts(page, ".root", {
  strip: { selector: '[data-ui-part="strip"]', props: ["height"] },
  label: { selector: ".label", props: ["color"] },
  portal: { selector: "@.portal", props: ["background-color"] },
  divider: { selector: ":scope::before", props: ["width"] },
}), {
  strip: { height: "30px" }, label: { color: "rgb(49, 52, 59)" },
  portal: { "background-color": "rgb(255, 255, 255)" }, divider: { width: "1px", content: '""' },
});
await assert.rejects(readParts(page, ".missing", { title: ".label" }), /root not found/);
await assert.rejects(readParts(page, ".root", { title: ".missing" }), /part not found/);
await assert.rejects(shoot(page, [".root", ".missing"], "/unused"), /Screenshot element not found/);
const screenshotDir = await mkdtemp(join(tmpdir(), "frontend-script-check-"));
globalThis.scrollX = 30;
globalThis.scrollY = 520;
try {
  const clip = await shoot({ ...page, screenshot: async ({ path, clip }) => {
    assert.deepEqual(clip, { x: 24, y: 524, width: 132, height: 62 });
    await writeFile(path, "screenshot");
  } }, [".root"], join(screenshotDir, "scrolled.png"));
  assert.equal(clip.y, 524, "screenshot bounds must include the document scroll offset");
} finally {
  delete globalThis.scrollX;
  delete globalThis.scrollY;
  await rm(screenshotDir, { recursive: true, force: true });
}
await assert.rejects(run(page, [{ surprise: "noop" }]), /exactly one action/);

const checkbox = { checked: false, matches: () => true };
globalThis.document.querySelector = (selector) => selector === ".checkbox" ? checkbox : null;
const checkPage = {
  ...page,
  click: async () => { checkbox.checked = !checkbox.checked; },
  waitForFunction: async (callback, argument) => assert(callback(argument)),
};
await run(checkPage, [{ check: { selector: ".checkbox", checked: true } }]);
assert(checkbox.checked);
await run(checkPage, [{ check: { selector: ".checkbox", checked: true } }]);
assert(checkbox.checked, "idempotent check must not toggle an already selected checkbox");
await assert.rejects(run(checkPage, [{ check: { selector: ".checkbox", checked: "true" } }]), /boolean checked/);
await assert.rejects(run(page, [{ drag: { source: ".from", target: ".to", position: "sideways" } }]), /before\/after/);
delete globalThis.document;
delete globalThis.getComputedStyle;

// Configuration failures are caught before opening a task space.
const { main: capture } = await import("./capture.mjs");
await assert.rejects(capture({ only: ["not-a-configured-target"] }), /Unknown target/);
const { main: verify } = await import("./verify.mjs");
const config = await readFile(`${SKILL}references/verify.json`, "utf8").catch(() => null);
if (config === null) {
  await assert.rejects(verify({ url: "http://localhost:5180" }), /Cannot load references\/verify.json/);
} else {
  await assert.rejects(verify({ url: "http://localhost:5180", only: ["not-a-configured-target"] }), /Unknown target/);
}
console.log("scripts: offline checks passed");
