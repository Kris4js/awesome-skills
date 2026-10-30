import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { createServer } from "vite";
import tailwind from "@tailwindcss/vite";

const skill = fileURLToPath(new URL("..", import.meta.url));
const server = await createServer({
  configFile: false,
  root: resolve(skill, "gallery"),
  plugins: [tailwind()],
  resolve: { dedupe: ["react", "react-dom"] },
  server: { host: "127.0.0.1", port: 5191, strictPort: true, fs: { allow: [skill] } },
});
await server.listen();
server.printUrls();
for (const signal of ["SIGINT", "SIGTERM"]) process.once(signal, async () => { await server.close(); process.exit(0); });
