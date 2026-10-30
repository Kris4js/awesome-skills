// scripts/capture.sh [--output <directory>] [target…]
import { randomUUID } from "node:crypto";
import { mkdir, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

import { metadata, readParts, run, scrollExisting, shoot, SKILL, targetNames } from "./lib.mjs";

export async function main({ only = [], output = `${SKILL}references`, taskSpaceId } = {}) {
  const config = JSON.parse(await readFile(`${SKILL}references/capture.json`, "utf8"));
  if (!Array.isArray(config.pages)) throw new Error("capture.json requires a pages array");
  const targets = config.pages.flatMap((page) => (page.targets ?? []).map((target) => ({ page, target })));
  const names = targetNames(targets.map(({ target }) => target.name), only);
  const out = resolve(output);
  await mkdir(join(out, "specs"), { recursive: true });
  await mkdir(join(out, "shots"), { recursive: true });
  const scratch = await mkdtemp(join(out, ".frontend-capture-"));
  const report = [];
  let task;
  try {
    task = await taskSpace(taskSpaceId ?? `frontend capture ${randomUUID().slice(0, 8)}`);
    const browser = task.page("p1");
    for (const name of names) {
      const { page, target } = targets.find(({ target }) => target.name === name);
      console.log(`capture ${name}`);
      try {
        if (!target.root || !target.parts || !Object.keys(target.parts).length) {
          throw new Error(`${name}: root and nonempty parts are required`);
        }
        await browser.goto(page.url);
        await browser.waitForSelector(page.ready ?? target.root, { timeout: 30000 });
        await browser.mouse.move(5, 600);
        await scrollExisting(browser, target.root);
        await run(browser, target.steps);
        await browser.waitForSelector(target.root, { timeout: 20000 });
        await browser.waitForTimeout(200);
        const parts = await readParts(browser, target.root, target.parts);
        const shotPath = join(scratch, `${name}.png`);
        const clip = await shoot(browser, target.shot ?? [target.root], shotPath, target.pad ?? 16);
        const spec = { name, ...(await metadata(browser, target.steps)), clip, parts };
        const specPath = join(scratch, `${name}.json`);
        await writeFile(specPath, `${JSON.stringify(spec, null, 2)}\n`);
        // Publish only after styles and the screenshot both succeed.
        await rename(shotPath, join(out, "shots", `${name}.png`));
        await rename(specPath, join(out, "specs", `${name}.json`));
        report.push({ name, status: "ok", shot: join(out, "shots", `${name}.png`) });
      } catch (error) {
        console.error(`${name}: ${error.message}`);
        report.push({ name, status: "error", error: error.message });
      }
    }
  } finally {
    try {
      if (task && taskSpaceId === undefined) await task.finish({ keep: [] });
    } finally {
      await rm(scratch, { recursive: true, force: true });
    }
  }
  if (!report.length || report.some((row) => row.status !== "ok")) process.exitCode = 1;
  console.log(JSON.stringify(report, null, 2));
  return report;
}
