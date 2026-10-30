// Pass arguments through a private entry module, never through shared /tmp files or shell code.
import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const [mode, ...args] = process.argv.slice(2);
if (!["capture", "verify"].includes(mode)) throw new Error("Expected capture or verify");
const options = { only: [] };
if (mode === "verify") {
  options.url = args.shift();
  if (!options.url || !/^https?:\/\//.test(options.url)) throw new Error("Usage: verify.sh <http(s) URL> [--output <directory>] [target…]");
}
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--output") {
    if (!args[i + 1] || args[i + 1].startsWith("--")) throw new Error("--output requires a directory");
    options.output = resolve(args[++i]);
  } else {
    if (args[i].startsWith("--")) throw new Error(`Unknown option: ${args[i]}`);
    options.only.push(args[i]);
  }
}
const scratch = await mkdtemp(join(tmpdir(), "frontend-job-"));
try {
  const entry = join(scratch, "entry.mjs");
  const module = new URL(`./${mode}.mjs`, import.meta.url).href;
  await writeFile(entry, `import { main } from ${JSON.stringify(module)};\ntry { await main(${JSON.stringify(options)}); } catch (error) { console.error(error.stack ?? error); process.exitCode = 1; }\n`);
  const exit = await new Promise((resolveExit, reject) => {
    const child = spawn("ego-browser", ["nodejs", "-e", `await import(${JSON.stringify(pathToFileURL(entry).href)})`], { stdio: "inherit" });
    const interrupt = () => child.kill("SIGINT");
    const terminate = () => child.kill("SIGTERM");
    const cleanup = () => {
      process.off("SIGINT", interrupt);
      process.off("SIGTERM", terminate);
    };
    process.on("SIGINT", interrupt);
    process.on("SIGTERM", terminate);
    child.once("error", (error) => { cleanup(); reject(error); });
    child.once("exit", (code, signal) => { cleanup(); resolveExit(signal ? 1 : (code ?? 1)); });
  });
  process.exitCode = exit;
} finally {
  await rm(scratch, { recursive: true, force: true });
}
