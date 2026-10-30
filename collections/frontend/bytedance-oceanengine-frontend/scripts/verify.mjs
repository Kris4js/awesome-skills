// scripts/verify.sh <page URL> [--output <directory>] [target…]
import { randomUUID } from "node:crypto";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import { cssEqual, metadata, readParts, run, scrollExisting, shoot, SKILL, targetNames } from "./lib.mjs";

export async function main({ url, only = [], output, taskSpaceId } = {}) {
  if (!url || !/^https?:\/\//.test(url)) throw new Error("verify requires an http(s) page URL");
  let rules;
  try {
    rules = JSON.parse(await readFile(`${SKILL}references/verify.json`, "utf8"));
  } catch (error) {
    throw new Error(`Cannot load references/verify.json: ${error.message}`);
  }
  if (!rules || Array.isArray(rules) || typeof rules !== "object") {
    throw new Error("verify.json must map target names to {root?, ready?, steps?, shot?, parts}");
  }
  const names = targetNames(Object.keys(rules), only);
  const overrides = JSON.parse(await readFile(`${SKILL}references/overrides.json`, "utf8").catch((error) => {
    if (error.code === "ENOENT") return "{}";
    throw error;
  }));
  const specs = {};
  for (const name of names) {
    const rule = rules[name];
    if (!rule?.parts || !Object.keys(rule.parts).length) throw new Error(`${name}: nonempty parts required`);
    if (rule.tolerance !== undefined && (!Number.isFinite(rule.tolerance) || rule.tolerance < 0 || rule.tolerance > 0.1)) {
      throw new Error(`${name}: tolerance must be between 0 and 0.1px`);
    }
    specs[name] = JSON.parse(await readFile(`${SKILL}references/specs/${name}.json`, "utf8"));
    for (const [part, definition] of Object.entries(rule.parts)) {
      if (!Array.isArray(definition?.props) || !definition.props.length || definition.props.some((prop) => typeof prop !== "string")) {
        throw new Error(`${name}.${part}: nonempty props array required`);
      }
      if (!specs[name].parts?.[part]) throw new Error(`${name}.${part}: reference part missing`);
      for (const prop of definition.props) {
        const expected = overrides[name]?.[part]?.[prop] ?? specs[name].parts[part][prop];
        if (typeof expected !== "string" || !expected.trim()) throw new Error(`${name}.${part}.${prop}: reference value missing`);
      }
    }
  }
  const out = output ? resolve(output) : await mkdtemp(join(tmpdir(), "frontend-verify-"));
  await mkdir(out, { recursive: true });
  const report = [];
  let task;
  try {
    task = await taskSpace(taskSpaceId ?? `frontend verify ${randomUUID().slice(0, 8)}`);
    const page = task.page("p1");
    for (const name of names) {
      console.log(`verify ${name}`);
      const rule = rules[name];
      const root = rule.root ?? `[data-ui="${name}"]`;
      try {
        await page.goto(url);
        await page.waitForSelector(rule.ready ?? root, { timeout: 15000 });
        // Scroll before hover: scrolling afterward can close a tooltip or shift its trigger.
        await scrollExisting(page, rule.ready ?? root);
        await run(page, rule.steps);
        await page.waitForSelector(root, { timeout: 15000 });
        const ours = await readParts(page, root, rule.parts);
        const diffs = [];
        for (const [part, definition] of Object.entries(rule.parts)) {
          for (const prop of definition.props) {
            const expected = overrides[name]?.[part]?.[prop] ?? specs[name].parts[part][prop];
            if (!cssEqual(expected, ours[part][prop], prop, rule.tolerance ?? 0.1)) {
              diffs.push({ part, prop, expected, actual: ours[part][prop] });
            }
          }
        }
        const shot = join(out, `${name}.png`);
        const clip = await shoot(page, rule.shot ?? [root], shot, rule.pad ?? 16);
        report.push({ name, status: diffs.length ? "differs" : "ok", diffs, shot, clip,
          reference: `${SKILL}references/shots/${name}.png`, ...(await metadata(page, rule.steps)) });
      } catch (error) {
        console.error(`${name}: ${error.message}`);
        report.push({ name, status: "error", error: error.message });
      }
    }
  } finally {
    try {
      if (task && taskSpaceId === undefined) await task.finish({ keep: [] });
    } finally {
      await writeFile(join(out, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
    }
  }
  for (const row of report) {
    console.log(`${row.status.padEnd(8)} ${row.name}`);
    for (const diff of row.diffs ?? []) console.log(`  ${diff.part}.${diff.prop}: expected ${diff.expected}, got ${diff.actual}`);
  }
  console.log(`report: ${join(out, "report.json")}`);
  if (!report.length || report.some((row) => row.status !== "ok")) process.exitCode = 1;
  return report;
}
