import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const routes = ["/", "/cards", "/cases", "/development", "/games", "/privacy", "/products", "/rescue", "/sync", "/teams", "/oprosy", "/oprosy/otvet"];
const output = new URL("../docs/", import.meta.url);
const server = spawn(process.execPath, ["node_modules/vinext/dist/cli.js", "start", "-p", "4175", "-H", "127.0.0.1"], { stdio: "inherit" });

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch("http://127.0.0.1:4175/");
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("The local site did not start in time.");
}

try {
  await waitForServer();
  await rm(output, { recursive: true, force: true });
  await cp(new URL("../dist/client/", import.meta.url), output, { recursive: true });

  for (const route of routes) {
    const response = await fetch(`http://127.0.0.1:4175${route}`);
    if (!response.ok) throw new Error(`Unable to export ${route}: ${response.status}`);
    const html = await response.text();
    const target = route === "/" ? new URL("index.html", output) : new URL(`.${route}/index.html`, output);
    await mkdir(new URL("./", target), { recursive: true });
    await writeFile(target, html);
  }

  await writeFile(new URL("CNAME", output), "it-therapy.ru\n");
  await writeFile(new URL(".nojekyll", output), "");
  await cp(new URL("index.html", output), new URL("404.html", output));
} finally {
  server.kill("SIGTERM");
}
